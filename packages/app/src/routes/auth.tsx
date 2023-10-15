import { createMutation } from "@tanstack/solid-query";
import { createEffect } from "solid-js";
import { useSearchParams } from "solid-start";

const AuthPage = () => {
  const [sp] = useSearchParams<{ code: string; redirect: string }>();

  const x = createMutation((code: string) => {
    return fetch(`${import.meta.env.VITE_AUTH_URL}/token`, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "github",
        code,
        redirect_uri: `${location.origin}/auth?redirect=${sp.redirect}`,
      }),
    }).then((r) => r.json() as Promise<{ access_token: string }>);
  });

  createEffect(async () => {
    const token = sp.code;
    const session_set = await x.mutateAsync(token);
    if (session_set) {
      document.cookie = `session=${session_set.access_token}; path=/`;
      window.location.href = sp.redirect ?? "/";
    }
  });

  return (
    <div class="container mx-auto flex flex-col py-10">
      <div class="flex w-full flex-col gap-2 items-center justify-center">
        <span>Loggin you in...</span>
        <span>Redirecting automatically...</span>
      </div>
    </div>
  );
};

export default AuthPage;
