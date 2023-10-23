import { Accessor, Setter, createContext, createSignal, useContext } from "solid-js";
import { User } from "../../../core/src/entities/users";

type UseAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  expiresAt: Date | null;
  user: User.Frontend | null;
};

export const AuthContext = createContext<[Accessor<UseAuth>, Setter<UseAuth>]>([
  (() => ({
    isLoading: true,
    isAuthenticated: false,
    token: null,
    expiresAt: null,
    user: null,
  })) as Accessor<UseAuth>,
  (() => {}) as Setter<UseAuth>,
]);

export const AuthP = (props: { children: any }) => {
  const [AuthStore, setAuthStore] = createSignal<UseAuth>({
    isLoading: true,
    isAuthenticated: false,
    token: null,
    expiresAt: null,
    user: null,
  });
  return <AuthContext.Provider value={[AuthStore, setAuthStore]}>{props.children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used within an AuthProvider");
  return auth;
};
