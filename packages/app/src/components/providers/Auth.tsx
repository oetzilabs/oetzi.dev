import { User } from "@oetzidev/core/entities/users";
import { createQuery, useQueryClient } from "@tanstack/solid-query";
import { Accessor, Setter, createContext, createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { Queries } from "../../utils/api/queries";
import { parseCookie } from "solid-start";

export type Auth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: User.Frontend | null;
};

export const AuthContext = createContext<{
  auth: [Accessor<Auth>, Setter<Auth>];
  saveUser: (token: string) => Promise<boolean>;
}>({
  auth: [
    (() => ({
      isLoading: true,
      isAuthenticated: false,
      token: null,
      expiresAt: null,
      user: null,
    })) as Accessor<Auth>,
    (() => {}) as Setter<Auth>,
  ],
  saveUser: () => Promise.reject("Not implemented yet"),
});

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an OfflineFirst");
  const auth = ctx.auth;
  if (!auth) throw new Error("useAuth must be used within an OfflineFirst");
  return auth;
};

export const AuthProvider = (props: { children: any }) => {
  const queryClient = useQueryClient();
  if (!queryClient) throw new Error("OfflineFirst must be used within a QueryClientProvider");

  const [AuthStore, setAuthStore] = createSignal<Auth>({
    isLoading: true,
    isAuthenticated: false,
    token: null,
    user: null,
  });

  const session = createQuery(() => ({
    queryKey: ["session"],
    queryFn: async () => {
      const cookies = parseCookie(document.cookie);
      const c = cookies["session"];
      if (!c) return Promise.reject("No session cookie found.");
      const user = await Queries.session(c);
      if (!user.success) return Promise.reject("Something went wrong.");
      const userData = user.user;
      if (!userData) return Promise.reject("Something went wrong. No user data.");
      return [c, userData] as [string, User.Frontend];
    },
  }));

  createEffect(() => {
    if (!session.isSuccess) {
      setAuthStore({
        isLoading: false,
        isAuthenticated: false,
        token: null,
        expiresAt: null,
        user: null,
      });
      return;
    }
    const user = session.data;
    if (!user) return;
    setAuthStore({
      isLoading: false,
      isAuthenticated: true,
      token: user[0],
      user: user[1],
    });
  });

  return (
    <AuthContext.Provider
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
        auth: [AuthStore, setAuthStore],
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const isLoggedIn = () => {
  const [auth] = useAuth();
  return auth().isAuthenticated;
};
