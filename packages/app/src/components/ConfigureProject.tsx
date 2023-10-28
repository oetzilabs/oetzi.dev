import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { Queries } from "../utils/api/queries";
import { useAuth } from "./providers/OfflineFirst";
import { cn } from "../utils/cn";
import { Mutations } from "../utils/api/mutations";
import { ConstructIcons } from "./ConstructsIcons";
import { A } from "@solidjs/router";

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
      refetchInterval: 0,
      refetchOnWindowFocus: false,
    }
  );

  const syncProject = createMutation(
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Mutations.Projects.syncOne(token, props.projectId);
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
              <Switch
                fallback={
                  <div class="w-full flex flex-col gap-2.5">
                    <div class="w-full flex flex-row items-center justify-center p-10 bg-black dark:bg-white text-white dark:text-black rounded-md font-semibold text-sm">
                      There are no constructs in this project.
                    </div>
                  </div>
                }
              >
                <Match when={(project.data?.constructs ?? []).length > 0 && (project.data?.constructs ?? [])}>
                  {(constructs) => (
                    <div class="w-full grid grid-cols-4 gap-2.5">
                      <For each={constructs()}>
                        {(construct) => (
                          <A
                            href={`constructs/${construct.id}`}
                            class="bg-black dark:bg-white p-4 text-white dark:text-black font-bold w-full flex flex-col gap-2.5 rounded-md hover:bg-neutral-900 dark:hover:bg-neutral-100 active:bg-neutral-800 dark:active:bg-neutral-200"
                          >
                            <div class="text-xs font-normal">{ConstructIcons[construct.type]}</div>
                            <span>{construct.name}</span>
                            <A
                              target="_blank"
                              href={construct.href}
                              class="bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md active:bg-neutral-200 dark:active:bg-neutral-800 px-2.5 py-1 items-center flex flex-row gap-2.5 text-black dark:text-white w-max"
                            >
                              <span>More Info</span>
                            </A>
                          </A>
                        )}
                      </For>
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
