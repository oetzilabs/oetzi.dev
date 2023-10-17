import { createQuery } from "@tanstack/solid-query";
import { Queries } from "../utils/api/queries";
import { useAuth } from "./Auth";
import { Switch, Match, For } from "solid-js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { CreateStack } from "./CreateStack";
import { A } from "@solidjs/router";
dayjs.extend(advancedFormat);

export const Stacks = () => {
  const [user] = useAuth();

  const stacks = createQuery(
    () => ["user_stacks"],
    () => {
      const u = user();
      if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.userStacks(token);
    },
    {
      get enabled() {
        const u = user();
        return u.isAuthenticated && !!u.token;
      },
      refetchOnWindowFocus: false,
      refetchInterval: 10_000,
    }
  );

  return (
    <Switch
      fallback={
        <div class="flex items-center justify-center w-full py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      }
    >
      <Match when={stacks.isSuccess && stacks.data}>
        {(data) => (
          <div class="grid grid-cols-4 w-full gap-2">
            <For
              each={data()}
              fallback={
                <div class="col-span-full bg-white/[0.02] backdrop-blur-md rounded-lg p-10 border border-black/5 dark:border-white/5 flex flex-col items-center justify-center gap-4">
                  <p class="font-medium">You have no stacks.</p>
                  <A
                    href="/dashboard/stacks/create"
                    class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black font-medium"
                  >
                    Create Stack
                  </A>
                </div>
              }
            >
              {({ stack }) => (
                <div class="bg-white/[0.02] backdrop-blur-md rounded-lg p-4 border border-black/5 dark:border-white/5">
                  <h1 class="">{stack.name}</h1>
                  <p class="">{dayjs(stack.createdAt).format("Do MMMM YYYY")}</p>
                </div>
              )}
            </For>
          </div>
        )}
      </Match>
    </Switch>
  );
};
