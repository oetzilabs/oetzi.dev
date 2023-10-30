import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { toast } from "solid-toast";
import { useAuth } from "../../components/providers/OfflineFirst";
import NewProject from "../../components/NewProject";
import { Mutations } from "../../utils/api/mutations";
import { Queries } from "../../utils/api/queries";
import { cn } from "../../utils/cn";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Project } from "../../components/Project";
import { useOfflineFirst } from "../../components/providers/OfflineFirst";
import { FakeProgressBar } from "../../components/FakeProgressbar";
dayjs.extend(advancedFormat);

export default function DashboardPage() {
  const [user] = useAuth();
  const offlineFirst = useOfflineFirst();
  const [timer, setTimer] = createSignal(false);
  const [timerInterval, setTimerInterval] = createSignal(5);
  const queryClient = useQueryClient();

  const syncProjects = createMutation(
    async () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Mutations.Projects.sync(token);
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

  const deleteProject = createMutation(
    async (id: string) => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Mutations.Projects.remove(token, id);
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

  const confirmRemoveProject = async (id: string) => {
    // use toast
    toast.custom(
      <div class="flex flex-col gap-2.5 relative p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md shadow-md overflow-clip">
        <div class="flex flex-col gap-1.5 text-neutral-900 dark:text-neutral-100">
          <h3 class="text-md font-bold">Are you sure?</h3>
          <p class="text-sm font-medium">This action is irreversible.</p>
        </div>
        <div class="flex flex-row items-center justify-end gap-2.5">
          <button
            class="bg-black dark:bg-white rounded-md text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 active:bg-black/90 dark:active:bg-white/90 px-2 py-1 font-bold"
            aria-label="Cancel"
            onClick={() => toast.dismiss()}
          >
            Cancel!
          </button>
          <button
            class="bg-red-50 dark:bg-red-950 rounded-md text-red-900 dark:text-red-50 hover:bg-red-50 dark:hover:bg-red-900 active:bg-red-50 dark:active:bg-red-800 px-2 py-1 font-bold"
            onClick={async () => {
              await deleteProject.mutateAsync(id);
              if (queryClient) await queryClient.invalidateQueries(["user_projects"]);
            }}
            aria-label="Delete Project"
          >
            Yes, delete!
          </button>
        </div>
        <FakeProgressBar time={5000} />
      </div>,
      {
        duration: 5000,
        position: "bottom-right",
      }
    );
  };
  let searchRef: HTMLInputElement;

  onMount(() => {
    //keybind for CTRL + F or F3 or `/`
    const handler = (e: KeyboardEvent) => {
      if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        searchRef.focus();
      }
      if (e.key === "/" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        searchRef.focus();
      }
      if (e.key === "F3") {
        e.preventDefault();
        searchRef.focus();
      }
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => {
      window.removeEventListener("keydown", handler);
    });
  });

  return (
    <div class="container mx-auto flex flex-col gap-8 py-10">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl font-bold">Dashboard</h1>
      </div>
      <div class="flex flex-row items-center justify-between">
        <h2 class="text-2xl font-bold">Projects</h2>
        <div class="flex flex-row gap-2.5">
          <input
            ref={searchRef!}
            type="text"
            class="px-2 py-1 rounded-md border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 bg-white dark:bg-black"
            placeholder="Search"
            onInput={(e) => {
              offlineFirst.filterProjects({
                search: e.target.value,
              });
            }}
          />
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
            disabled={offlineFirst.isSyncing() || syncProjects.isLoading || timer() || user().isLoading}
            onClick={async () => {
              await offlineFirst.syncProjects();
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
                      "animate-spin": offlineFirst.isSyncing() || syncProjects.isLoading,
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
        </div>
      </div>
      <div class="grid grid-cols-4 w-full gap-4">
        <For
          each={offlineFirst.userProjects()}
          fallback={
            <Switch>
              <Match when={user().isLoading}>
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.01] gap-6 rounded-md backdrop-blur-sm border border-black/5 dark:border-white/5">
                  <h3 class="text-xl font-bold">No Projects</h3>
                  <p class="text-lg font-medium">Oetzi has no projects to view.</p>
                </div>
              </Match>
              <Match when={user().isAuthenticated && offlineFirst.projectsFilter().search?.length === 0}>
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.01] gap-6 rounded-md backdrop-blur-sm border border-black/5 dark:border-white/5">
                  <h3 class="text-xl font-bold">No Projects</h3>
                  <p class="text-lg font-medium">You have no projects.</p>
                  <NewProject />
                </div>
              </Match>
              <Match when={user().isAuthenticated && offlineFirst.projectsFilter().search?.length > 0}>
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.01] gap-6 rounded-md backdrop-blur-sm border border-black/5 dark:border-white/5">
                  <h3 class="text-xl font-bold">No Projects for '{offlineFirst.projectsFilter().search}'</h3>
                  <p class="text-lg font-medium">There are no projects with your search parameter.</p>
                  <button
                    class="px-2 py-1 rounded-md bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-black/90 dark:hover:bg-white/90 active:bg-black/90 dark:active:bg-white/90"
                    onClick={() => {
                      searchRef.value = "";
                      offlineFirst.filterProjects({
                        search: "",
                      });
                    }}
                  >
                    <span class="font-bold select-none">Clear Search</span>
                  </button>
                </div>
              </Match>
            </Switch>
          }
        >
          {(project) => (
            <Project
              project={project}
              confirmRemoveProject={confirmRemoveProject}
              isDeleting={deleteProject.isLoading}
              withMenu
            />
          )}
        </For>
      </div>
    </div>
  );
}
