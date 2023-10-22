import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { Queries } from "../utils/api/queries";
import { useAuth } from "./Auth";
import { cn } from "../utils/cn";
import { Mutations } from "../utils/api/mutations";

type ConfigureProjectProps = {
  projectId: string;
};

export const ConfigureProject = (props: ConfigureProjectProps) => {
  const [user] = useAuth();
  const quertClient = useQueryClient();
  const project = createQuery(
    () => ["project", props.projectId],
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.project(token, props.projectId);
    },
    {
      get enabled() {
        const u = user();
        // const token = u.token;
        return !u.isLoading && u.isAuthenticated;
      },
      refetchInterval: 5_000,
      refetchOnWindowFocus: false,
    }
  );

  const analysis = createQuery(
    () => ["analysis", props.projectId],
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.analyzeProject(token, props.projectId);
    },
    {
      get enabled() {
        const u = user();
        // const token = u.token;
        return !u.isLoading && u.isAuthenticated && project.isSuccess;
      },
      refetchInterval: 5_000,
      refetchOnWindowFocus: false,
    }
  );

  const syncProject = createMutation(
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Mutations.syncProject(token, props.projectId);
    },
    {
      async onSuccess() {
        await quertClient.invalidateQueries(["analysis", props.projectId]);
      },
    }
  );

  return (
    <div class="w-full flex flex-col gap-4">
      <Switch
        fallback={
          <div class="w-full flex flex-col gap-2.5">
            <div class="w-full flex flex-col gap-6">
              <div class="w-full flex flex-row items-center justify-between">
                <div class="w-[200px] h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div class="flex flex-row items-center gap-2.5">
                  <div class="w-[80px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                  <div class="w-[80px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                </div>
              </div>
              <div class="w-full flex flex-row items-center gap-2">
                <div class="w-[100px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div class="w-[50px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div class="w-[150px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div class="w-[80px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div class="w-[120px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div class="w-[240px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              </div>
              <div class="w-full flex flex-col gap-4">
                <div class="w-[200px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div class="w-[100px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              </div>
            </div>
          </div>
        }
      >
        <Match when={!project.isLoading && project.isSuccess && project.data}>
          {(data) => (
            <div class="w-full flex flex-col gap-2.5">
              <div class="w-full flex flex-col gap-2.5">
                <div class="w-full flex flex-row items-start justify-between">
                  <div class="flex flex-col gap-2">
                    <span class="text-3xl font-medium">{data().name}</span>
                    <span>by {data().user.name}</span>
                  </div>
                  <div class="flex flex-row items-center gap-2.5">
                    <button class="bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 rounded-md active:bg-neutral-400 active:text-white dark:hover:bg-neutral-800 dark:active:bg-neutral-700 px-2.5 py-1 items-center flex flex-row gap-2.5">
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
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      class="bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 rounded-md active:bg-neutral-800 active:text-white dark:hover:bg-neutral-100 dark:active:bg-neutral-200 px-2.5 py-1 items-center flex flex-row gap-2.5"
                      disabled={syncProject.isLoading}
                      onClick={async () => {
                        await syncProject.mutateAsync();
                      }}
                    >
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
                        class={cn({
                          "animate-spin": syncProject.isLoading,
                        })}
                      >
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                      </svg>
                      <span class="font-medium">Sync</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="w-full flex flex-col gap-2.5">
                <span>{(data().description ?? "").length > 0 ? data().description : "No description"}</span>
              </div>
              <Switch fallback={<div class="w-full flex flex-col gap-2.5"></div>}>
                <Match when={!analysis.isLoading && analysis.isSuccess && analysis.data}>
                  {(data) => (
                    <div class="w-full flex flex-col gap-2.5">
                      <For each={data()}>{(stack) => <div class="w-full flex flex-col gap-2.5">{stack}</div>}</For>
                    </div>
                  )}
                </Match>
              </Switch>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
};
