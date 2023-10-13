import { createMutation, createQuery } from "@tanstack/solid-query";
import { createEffect } from "solid-js";
import { useLocation } from "solid-start";
import { Queries } from "../utils/api/queries";

const AuthPage = () => {
  const { hash } = useLocation();

  const x = createMutation((token: string) => {
    return fetch("/api/auth/callback", {
      body: JSON.stringify({ token }),
      method: "POST",
    }).then((res) => res.json());
  });

  createEffect(async () => {
    const token = hash.split("#")[1].split("=")[1];
    const session_set = await x.mutateAsync(token);
    if (session_set) {
      console.log("session set", session_set);
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
