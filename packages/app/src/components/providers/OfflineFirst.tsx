import { Project } from "@oetzidev/core/entities/projects";
import { User } from "@oetzidev/core/entities/users";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Accessor, Setter, createContext, createEffect, createSignal, onMount, useContext } from "solid-js";
import { z } from "zod";
import { Mutations } from "../../utils/api/mutations";
import { Queries, userProjects, session } from "../../utils/api/queries";
import Dexie from "dexie";
import { IDB } from "./IndexedDB";

const DB_NAME = "oetzi.dev";
type UseAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  expiresAt: Date | null;
  user: User.Frontend | null;
};

export const OffineFirstContext = createContext<{
  isOnline: Accessor<boolean>;
  setIsOnline: Setter<boolean>;
  addProject: (project: Parameters<typeof Project.create>[1]) => Promise<Project.Frontend>;
  getProject: (id: string) => Promise<NonNullable<User.Frontend>["projects"][number] | null>;
  userProjects: Accessor<NonNullable<User.Frontend>["projects"]>;
  syncDb: () => Promise<NonNullable<User.Frontend>["projects"]>;
  auth: [Accessor<UseAuth>, Setter<UseAuth>];
  saveUser: (token: string) => Promise<boolean>;
}>({
  isOnline: () => false,
  setIsOnline: () => {},
  addProject: () => Promise.reject("Not implemented yet"),
  getProject: (id: string) => Promise.reject("Not implemented yet"),
  userProjects: () => [],
  syncDb: () => Promise.reject("Not implemented yet"),
  auth: [
    (() => ({
      isLoading: true,
      isAuthenticated: false,
      token: null,
      expiresAt: null,
      user: null,
    })) as Accessor<UseAuth>,
    (() => {}) as Setter<UseAuth>,
  ],
  saveUser: () => Promise.reject("Not implemented yet"),
});

export const useAuth = () => {
  const ctx = useContext(OffineFirstContext);
  if (!ctx) throw new Error("useAuth must be used within an OfflineFirst");
  const auth = ctx.auth;
  if (!auth) throw new Error("useAuth must be used within an OfflineFirst");
  return auth;
};

export const OfflineFirst = (props: { children: any }) => {
  const queryClient = useQueryClient();
  if (!queryClient) throw new Error("OfflineFirst must be used within a QueryClientProvider");

  const [AuthStore, setAuthStore] = createSignal<UseAuth>({
    isLoading: true,
    isAuthenticated: false,
    token: null,
    expiresAt: null,
    user: null,
  });

  const createProject = createMutation((proj: Parameters<typeof Project.create>[1]) => {
    const _user = AuthStore();
    const token = _user?.token;
    if (!token) return Promise.reject("Not logged in");
    return Mutations.Projects.create(token, { ...proj, description: proj.description ?? "" });
  });

  const db = new IDB(DB_NAME);
  const addProject = async (project: Parameters<typeof Project.create>[1]) => {
    const _user = AuthStore();
    const token = _user?.token;
    if (!token) return Promise.reject("Not logged in");
    // optimistic update
    const _project = await db.createProjects.add(project);
    const _p = await createProject.mutateAsync(project);
    if (!_p) {
      await db.createProjects.delete(_project);
      return Promise.reject("Something went wrong.");
    }
    await db.projects.put(_p);
    return _p;
  };

  const getProject = async (id: string) => {
    const _user = AuthStore();
    const token = _user?.token;
    if (!token) return Promise.reject("Not logged in");
    const _p = await db.projects.filter((p) => p.id === id).first();
    if (!_p) return null;
    return _p;
  };

  const [userProjects, setUserProjects] = createSignal([] as NonNullable<User.Frontend>["projects"]);

  createEffect(async () => {
    const _user = AuthStore();
    const token = _user?.token;
    if (!token) return [] as NonNullable<User.Frontend>["projects"];
    const _userProjects = await db.projects.toArray().catch(() => [] as NonNullable<User.Frontend>["projects"]);
    setUserProjects(_userProjects);
  });

  const syncDb = async () => {
    const _user = AuthStore();
    const token = _user?.token;
    if (!token) return Promise.reject("Not logged in");
    const syncedProjects = await Mutations.Projects.sync(token);
    if (!syncedProjects) return Promise.reject("Something went wrong.");
    await db.projects.clear();
    await db.projects.bulkAdd(syncedProjects);
    await db.createProjects.clear();
    // setUserProjects(syncedProjects);
    return syncedProjects;
  };

  const [isOnline, setIsOnline] = createSignal(true);

  createEffect(() => {
    const handler = async () => {
      setIsOnline(window.navigator.onLine);
    };
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    return () => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
    };
  });

  createEffect(async () => {
    const _user = AuthStore();
    const token = _user?.token;
    if (!token) return;
    const userProjects = await Queries.userProjects(token);
    if (!userProjects) return;
    await db.projects.clear();
    await db.projects.bulkAdd(userProjects);
    await db.createProjects.clear();
    // setUserProjects(userProjects);
  });

  return (
    <OffineFirstContext.Provider
      value={{
        saveUser: async (token: string) => {
          if (!token) return Promise.reject("No token provided.");
          const user = await Queries.session(token);
          if (!user.success) return Promise.reject("Something went wrong.");
          const userData = user.user;
          if (!userData) return Promise.reject("Something went wrong. No user data.");
          setAuthStore({
            isLoading: false,
            isAuthenticated: true,
            token,
            expiresAt: user.expiresAt,
            user: userData,
          });
          const ses = await db.sessions
            .put({ token, user: JSON.stringify(userData) }, 1)
            .then(() => true)
            .catch((e) => {
              console.error("Something went wrong.", e);
              return false;
            });
          if (!ses) return Promise.reject("Something went wrong.");

          return ses;
        },
        isOnline,
        setIsOnline,
        addProject,
        userProjects,
        getProject,
        auth: [AuthStore, setAuthStore],
        syncDb,
      }}
    >
      {props.children}
    </OffineFirstContext.Provider>
  );
};

export const useOfflineFirst = () => {
  const context = useContext(OffineFirstContext);
  if (!context) throw new Error("useOfflineFirst must be used within a OfflineFirst");
  return context;
};
