import { Project } from "@oetzidev/core/entities/projects";
import { User } from "@oetzidev/core/entities/users";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { Accessor, Setter, createContext, createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { Mutations } from "../../utils/api/mutations";
import { Queries } from "../../utils/api/queries";
import { IDB } from "./IndexedDB";

const DB_NAME = "oetzi.dev";
export type UseAuth = {
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
  syncProjects: () => Promise<NonNullable<User.Frontend>["projects"]>;
  auth: [Accessor<UseAuth>, Setter<UseAuth>];
  saveUser: (token: string) => Promise<boolean>;
  isSyncing: Accessor<boolean>;
  filterProjects: Setter<{ [key: string]: string }>;
  projectsFilter: Accessor<{ [key: string]: string }>;
}>({
  isOnline: () => false,
  setIsOnline: () => {},
  addProject: () => Promise.reject("Not implemented yet"),
  getProject: (id: string) => Promise.reject("Not implemented yet"),
  userProjects: () => [],
  syncDb: () => Promise.reject("Not implemented yet"),
  syncProjects: () => Promise.reject("Not implemented yet"),
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
  isSyncing: () => false,
  filterProjects: () => {},
  projectsFilter: () => ({}),
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
    onCleanup(() => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
    });
  });

  const [offlineUserProjects, setOfflineUserProjects] = createSignal<NonNullable<User.Frontend>["projects"]>([]);

  const uP = createQuery(
    () => ["user_projects"],
    async () => {
      const _user = AuthStore();
      const token = _user?.token;
      if (!token) return [] as NonNullable<User.Frontend>["projects"];
      const ups = await Queries.userProjects(token);
      await db.projects.clear();
      await db.projects.bulkAdd(ups);
      return ups;
    },
    {
      get enabled() {
        const _user = AuthStore();
        if (!_user) return false;
        return !_user.isLoading && _user.isAuthenticated;
      },
      refetchOnWindowFocus: false,
    }
  );

  createEffect(async () => {
    // update offlineUserProjects and load from db
    const uPs = (await db.projects.toArray()).sort((a, b) => {
      // sost by updatedAt and createdAt desc
      const aDate = a.createdAt;
      const bDate = b.createdAt;
      if (!aDate || !bDate) return 0;
      return dayjs(aDate).isBefore(dayjs(bDate)) ? 1 : -1;
    });
    setOfflineUserProjects(uPs);
  });

  const [projectsFilter, setProjectsFilter] = createSignal<{
    [key: string]: string;
  }>({
    search: "",
  });

  const filterProjects = (projects: NonNullable<User.Frontend>["projects"]) => {
    const _projects: NonNullable<User.Frontend>["projects"] = [];
    const filter = projectsFilter();
    if (!filter) return projects;
    const search = filter.search;
    if (!search) return projects;
    // old school search via normal for loop
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      // check on all values if they match
      const values = Object.values(p);
      for (let j = 0; j < values.length; j++) {
        const v = values[j];
        if (String(v).includes(search.toLowerCase())) {
          _projects.push(p);
          break;
        }
      }
    }
    return _projects;
  };

  const userProjects = () => {
    const ofPs = offlineUserProjects();
    let result = filterProjects(ofPs);
    if (isOnline()) {
      if (uP.isLoading) return result;
      if (!uP.isSuccess) return result;
      return filterProjects(uP.data);
    }
    return result;
  };

  const projectsSync = createMutation(async () => {
    const _user = AuthStore();
    const token = _user?.token;
    if (!token) return Promise.reject("Not logged in");
    const syncedProjects = await Mutations.Projects.sync(token);
    if (!syncedProjects) return Promise.reject("Something went wrong.");
    await db.projects.clear();
    await db.projects.bulkAdd(syncedProjects);
    await db.createProjects.clear();
    return syncedProjects;
  });

  const isSyncing = () => projectsSync.isLoading;

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
          return true;
        },
        isOnline,
        setIsOnline,
        addProject,
        userProjects,
        getProject,
        auth: [AuthStore, setAuthStore],
        syncDb,
        syncProjects: projectsSync.mutateAsync,
        isSyncing,
        filterProjects: setProjectsFilter,
        projectsFilter,
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
