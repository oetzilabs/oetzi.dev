import { createEffect } from "solid-js";
import { useLocation } from "solid-start";

export const AuthPage = () => {
  const { hash } = useLocation();

  createEffect(() => {
    const token = hash.split("token=")[1];
    if (token) {
      document.cookie = `session=${token}; path=/;`;
    }
    window.location.href = "/";
  });

  return (
    <div>
      <span>Loggin you in...</span>
      <span>Redirecting automatically...</span>
    </div>
  );
};
