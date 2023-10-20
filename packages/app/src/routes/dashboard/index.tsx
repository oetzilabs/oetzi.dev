import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { useAuth } from "../../components/Auth";
import NewProject from "../../components/NewProject";
import { Mutations } from "../../utils/api/mutations";
import { Queries } from "../../utils/api/queries";
import { cn } from "../../utils/cn";

export default function DashboardPage() {
  const [user] = useAuth();
  const [timer, setTimer] = createSignal(false);
  const [timerInterval, setTimerInterval] = createSignal(5);
  const queryClient = useQueryClient();

  const syncProjects = createMutation(
    async () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Mutations.syncProjects(token);
    },
    {
      onSuccess: () => {
        setTimer(false);
        setTimerInterval(5);
        setTimeout(() => {
          syncProjects.reset();
        }, 3000);
      },
      onError: () => {
        setTimer(true);
        setTimerInterval(5);
        const interval = setInterval(() => {
          setTimerInterval((prev) => prev - 1);
        }, 1000);

        setTimeout(() => {
          setTimer(false);
          clearInterval(interval);
          syncProjects.reset();
        }, 5500);
      },
    }
  );

  const userProjects = createQuery(
    () => ["user_projects"],
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.userProjects(token);
    },
    {
      get enabled() {
        const u = user();
        return !u.isLoading && u.isAuthenticated && u.token !== null;
      },
      refetchInterval: 60_000,
      refetchOnWindowFocus: false,
    }
  );

  const projects = createQuery(
    () => ["projects"],
    () => {
      return Queries.projects();
    },
    {
      get enabled() {
        const u = user();
        return !u.isLoading && !u.isAuthenticated;
      },
      refetchInterval: 60_000,
      refetchOnWindowFocus: false,
    }
  );

  const deleteProject = createMutation(
    async (id: string) => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Mutations.removeProject(token, id);
    },
    {
      onSuccess: () => {
        setTimer(false);
        setTimerInterval(5);
        setTimeout(() => {
          syncProjects.reset();
        }, 3000);
      },
      onError: () => {
        setTimer(true);
        setTimerInterval(5);
        const interval = setInterval(() => {
          setTimerInterval((prev) => prev - 1);
        }, 1000);

        setTimeout(() => {
          setTimer(false);
          clearInterval(interval);
          syncProjects.reset();
        }, 5500);
      },
    }
  );

  return (
    <div class="container mx-auto flex flex-col gap-8 py-10">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl font-bold">Dashboard</h1>
      </div>
      <div class="flex flex-row items-center justify-between">
        <h2 class="text-2xl font-bold">Projects</h2>
        <div>
          <Show when={user().isAuthenticated}>
            <button
              class={cn(
                "flex flex-row items-center justify-center gap-3 px-2.5 py-1",
                // disabled state
                "disabled:cursor-not-allowed disabled:opacity-20",
                {
                  "bg-black dark:bg-white hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black":
                    !syncProjects.isLoading,
                  "bg-neutral-100 dark:bg-neutral-950 rounded-md text-black dark:text-white cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 disabled:opacity-100":
                    syncProjects.isLoading || timer(),
                  "bg-green-200 dark:bg-green-900 rounded-md text-green-900 dark:text-green-50 cursor-not-allowed hover:bg-green-200 dark:hover:bg-green-900 active:bg-green-50 dark:active:bg-green-800":
                    syncProjects.isSuccess,
                  "bg-red-50 dark:bg-red-950 rounded-md text-red-900 dark:text-red-50 cursor-not-allowed hover:bg-red-50 dark:hover:bg-red-900 active:bg-red-50 dark:active:bg-red-800":
                    syncProjects.isError,
                }
              )}
              disabled={syncProjects.isLoading || timer() || user().isLoading}
              onClick={async () => {
                if (timer() || syncProjects.isLoading || user().isLoading) return;
                await syncProjects.mutateAsync();
              }}
            >
              <Switch
                fallback={
                  <div class="flex flex-row items-center justify-center gap-2.5">
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
                      class={cn("animate-none", {
                        "animate-spin": syncProjects.isLoading,
                      })}
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    <span class="font-bold select-none">Sync</span>
                  </div>
                }
              >
                <Match when={syncProjects.isSuccess}>
                  <div class="flex flex-row items-center justify-center gap-2.5">
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
                      <path d="M18 6 7 17l-5-5" />
                      <path d="m22 10-7.5 7.5L13 16" />
                    </svg>
                    <span class="font-bold select-none">Synced {syncProjects.data?.length} Projects</span>
                  </div>
                </Match>
                <Match when={syncProjects.isError}>
                  <div class="flex flex-row items-center justify-center gap-2.5">
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
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span class="font-bold select-none">Failed, retry again in {timerInterval()}s</span>
                  </div>
                </Match>
              </Switch>
            </button>
          </Show>
        </div>
      </div>
      <div class="grid grid-cols-4 w-full">
        <Switch
          fallback={
            <Switch
              fallback={
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.02] gap-6 rounded-md backdrop-blur-sm text-neutral-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
              <Match when={projects.isSuccess}>
                <For
                  each={projects.data}
                  fallback={
                    <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.02] gap-6 rounded-md backdrop-blur-sm border border-black/5 dark:border-white/5">
                      <h3 class="text-xl font-medium">There are currently no projects listed</h3>
                      <p class="text-md">Please check in on a later time!</p>
                    </div>
                  }
                >
                  {(project) => (
                    <div class=" bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-sm text-black dark:text-white p-2 rounded-md">
                      <h3 class="text-xl font-bold">{project.name}</h3>
                      <p class="text-lg font-medium">{project.description}</p>
                    </div>
                  )}
                </For>
              </Match>
              <Match when={!projects.isSuccess && projects.isError}>
                <div class="col-span-4 w-full p-10 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950 rounded-md">
                  <div class="bg-white dark:bg-black text-black dark:text-white p-2 rounded-md shadow-md">
                    <h3 class="text-xl font-bold">Error</h3>
                    <p class="text-lg font-medium">{JSON.stringify(projects.error)}</p>
                  </div>
                </div>
              </Match>
            </Switch>
          }
        >
          <Match when={user().isAuthenticated}>
            <Switch
              fallback={
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.02] gap-6 rounded-md backdrop-blur-sm text-neutral-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
              <Match when={userProjects.isSuccess}>
                <For
                  each={userProjects.data}
                  fallback={
                    <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.01] gap-6 rounded-md backdrop-blur-sm border border-black/5 dark:border-white/5">
                      <h3 class="text-xl font-bold">No Projects</h3>
                      <p class="text-lg font-medium">You have no projects.</p>
                      <NewProject />
                    </div>
                  }
                >
                  {(project) => (
                    <div class="bg-white dark:bg-black text-black dark:text-white p-2 rounded-md shadow-md">
                      <button
                        class="bg-red-50 dark:bg-red-950 rounded-md text-red-900 dark:text-red-50 hover:bg-red-50 dark:hover:bg-red-900 active:bg-red-50 dark:active:bg-red-800 px-2 py-1 font-bold"
                        onClick={async () => {
                          await deleteProject.mutateAsync(project.id);
                          await queryClient.invalidateQueries(["projects"]);
                        }}
                      >
                        DELETE
                      </button>
                      <h3 class="text-xl font-bold">{project.name}</h3>
                      <p class="text-lg font-medium">{project.description}</p>
                    </div>
                  )}
                </For>
              </Match>
              <Match when={!userProjects.isSuccess && userProjects.isError}>
                <div class="col-span-4 w-full p-10 flex flex-col items-center justify-center">
                  <div class="bg-white dark:bg-black text-black dark:text-white p-2 rounded-md shadow-md">
                    <h3 class="text-xl font-bold">Error</h3>
                    <p class="text-lg font-medium">{JSON.stringify(userProjects.error)}</p>
                  </div>
                </div>
              </Match>
            </Switch>
          </Match>
        </Switch>
      </div>
    </div>
  );
}
