import { A } from "@solidjs/router";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { For, Match, Show, Switch, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { toast } from "solid-toast";
import { FakeProgressBar } from "../components/FakeProgressbar";
import { Project } from "../components/Project";
import { useAuth } from "../components/providers/OfflineFirst";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { debounce } from "@solid-primitives/scheduled";
dayjs.extend(advancedFormat);

export default function DashboardPage() {
  const [user] = useAuth();
  const queryClient = useQueryClient();

  const [filterProjectSearch, filterProjects] = createSignal("");

  const projects = createQuery(
    () => ["projects", { search: filterProjectSearch() }],
    async () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      const search = filterProjectSearch();
      return Queries.userProjects(token, {
        search,
      });
    },
    {
      get enabled() {
        const u = user();
        return u.isAuthenticated;
      },
      keepPreviousData: true,
      // refetchInterval: 10_000,
    }
  );

  const deleteProject = createMutation(async (id: string) => {
    const u = user();
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");
    return Mutations.Projects.remove(token, id);
  });

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
              if (queryClient) await queryClient.invalidateQueries(["projects"]);
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
  const setFilterProjects = debounce(filterProjects, 500);

  return (
    <div class="container mx-auto flex flex-col gap-8 py-10">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl font-bold">Dashboard</h1>
      </div>
      <div class="flex flex-row items-center justify-between">
        <h2 class="text-2xl font-bold">Projects</h2>
        <div class="flex flex-row gap-2.5">
          <input
            disabled={user().isLoading}
            ref={searchRef!}
            type="text"
            class="px-2 py-1 rounded-sm border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 bg-white dark:bg-black"
            placeholder="Search"
            onInput={(e) => setFilterProjects(e.currentTarget.value)}
          />
          <Show when={user().isAuthenticated}>
            <A
              href={`/project/create`}
              class="flex flex-row gap-2.5 items-center justify-center bg-black dark:bg-white p-2 py-1 rounded-sm hover:bg-neutral-950 active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black"
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
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span class="text-md font-bold select-none">Add Project</span>
            </A>
          </Show>
        </div>
      </div>
      <div class="w-full flex flex-col">
        <Show
          when={user().isAuthenticated && projects.isSuccess && projects.data.length > 0}
          fallback={
            <Switch>
              <Match when={!user().isLoading && !user().isAuthenticated}>
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center gap-4 rounded-sm backdrop-blur-sm border border-neutral-200 dark:border-neutral-800">
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
                  >
                    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                    <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2" />
                    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                    <path d="M2 16h.01" />
                    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                    <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
                  </svg>
                  <h3 class="text-lg font-medium">You are not logged in</h3>
                  <A
                    href={`${
                      import.meta.env.VITE_AUTH_URL
                    }/authorize?provider=github&response_type=code&client_id=github&redirect_uri=${
                      window.location.origin
                    }/auth${encodeURIComponent(`?redirect=${window.location.pathname}`)}`}
                    rel="noreferrer"
                    class="py-1 px-2 rounded-sm bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-black/90 dark:hover:bg-white/90 active:bg-black/90 dark:active:bg-white/90"
                  >
                    Sign in with GitHub
                  </A>
                </div>
              </Match>
              <Match when={user().isLoading || projects.isLoading}>
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center gap-6 rounded-sm backdrop-blur-sm border border-neutral-200 dark:border-neutral-800">
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
                  <h3 class="text-lg font-medium">Loading</h3>
                </div>
              </Match>
              <Match
                when={
                  user().isAuthenticated &&
                  projects.isSuccess &&
                  projects.data.length > 0 &&
                  filterProjectSearch().length === 0
                }
              >
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.01] gap-6 rounded-md backdrop-blur-sm border border-black/5 dark:border-white/5">
                  <h3 class="text-xl font-bold">No Projects</h3>
                  <p class="text-lg font-medium">You have no projects.</p>
                  <A
                    href={`/project/create`}
                    class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    <span class="font-bold select-none">Create Project</span>
                  </A>
                </div>
              </Match>
              <Match when={user().isAuthenticated && filterProjectSearch().length > 0}>
                <div class="col-span-4 w-full p-20 flex flex-col items-center justify-center bg-black/[0.01] dark:bg-white/[0.01] gap-6 rounded-md backdrop-blur-sm border border-black/5 dark:border-white/5">
                  <h3 class="text-xl font-bold">No Projects for '{filterProjectSearch()}'</h3>
                  <p class="text-lg font-medium">There are no projects with your search parameter.</p>
                  <button
                    class="px-2 py-1 rounded-md bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-black/90 dark:hover:bg-white/90 active:bg-black/90 dark:active:bg-white/90"
                    onClick={() => {
                      searchRef.value = "";
                      setFilterProjects("");
                    }}
                  >
                    <span class="font-bold select-none">Clear Search</span>
                  </button>
                </div>
              </Match>
            </Switch>
          }
        >
          <table class="w-full table-auto border-spacing-4 border-collapse border border-neutral-200 dark:border-neutral-800 p-2">
            <thead class="border-b border-neutral-200 dark:border-neutral-800">
              <tr class="text-md font-bold select-none w-full">
                <th class="p-4 text-left w-min">Status</th>
                <th class="p-4 text-left">Name</th>
                <th class="p-4 text-right w-min">Stack</th>
                <th class="p-4 text-right w-min">Last Updated</th>
                <th class="p-4 text-right w-min">Actions</th>
              </tr>
            </thead>
            <tbody>
              <For each={projects.data}>
                {(project) => (
                  <Project
                    project={project}
                    confirmRemoveProject={confirmRemoveProject}
                    isDeleting={deleteProject.isLoading}
                  />
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>
    </div>
  );
}
