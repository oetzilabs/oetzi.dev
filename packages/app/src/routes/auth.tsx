import { createMutation } from "@tanstack/solid-query";
import { createEffect } from "solid-js";
import { useSearchParams } from "solid-start";

const AuthPage = () => {
  const [sp] = useSearchParams<{ code: string }>();

  const x = createMutation((code: string) => {
    return fetch(`${import.meta.env.VITE_AUTH_URL}/token`, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "github",
        code,
        redirect_uri: `${location.origin}/auth`,
      }),
    }).then((r) => r.json() as Promise<{ access_token: string }>);
  });

  createEffect(async () => {
    const token = sp.code;
    const session_set = await x.mutateAsync(token);
    if (session_set) {
      document.cookie = `session=${session_set.access_token}; path=/`;
      setTimeout(() => {
        window.location.href = "/";
      }, 5000);
    }
  });

  return (
    <div class="container flex flex-col gap-2.5 items-center justify-center p-10">
      <span>Loggin you in...</span>
      <span>Redirecting automatically...</span>
    </div>
  );
};

export default AuthPage;
