import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch, createEffect, createSignal, onCleanup } from "solid-js";
import { PublicProject } from "../components/PublicProject";
import { useAuth } from "../components/providers/OfflineFirst";
import { Queries } from "../utils/api/queries";

export default function Home() {
  const [load, setLoad] = createSignal(false);
  const [user] = useAuth();
  const projects = createQuery(
    () => ["public_projects"],
    () => {
      return Queries.projectsWithFilter();
    },
    {
      get enabled() {
        const x = load();
        return x;
      },
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 5,
      refetchInterval: 1000 * 60 * 5,
    }
  );

  createEffect(() => {
    setTimeout(() => {
      setLoad(true);
    }, 1000);

    onCleanup(() => {
      setLoad(false);
    });
  });

  return (
    <div class="flex container mx-auto flex-col gap-10 py-10">
      <div class="flex flex-col gap-10 py-32">
        <div class="flex flex-row items-center justify-center">
          <h1 class="text-9xl font-bold text-teal-300">OETZI.DEV</h1>
        </div>
        <div class="flex flex-col gap-4 items-center justify-center">
          <span class="text-2xl font-medium">I'm Ötzi, a 27 year young developer from Germany.</span>
          <span class="text-2xl font-medium">
            I'm currently working on a few projects, some of them are listed below.
          </span>
          <span class="text-lg font-medium select-none opacity-60">
            These are all my public projects. I will gradually add more projects to this list.
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-10 py-10">
        <h1 class="text-2xl font-bold select-none">Public Projects</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Switch>
            <Match when={projects.isLoading}>
              <div class="col-span-full flex flex-col items-center justify-center p-8">
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
            </Match>
            <Match when={projects.isError}>
              <div class="col-span-full flex flex-col items-center justify-center border border-neutral-200 dark:border-neutral-800 p-8 gap-4">
                <h3 class="text-xl font-bold select-none">An error occured while fetching the projects.</h3>
                <p class="text-md font-medium select-none">{(projects.error as Error)?.message}</p>
              </div>
            </Match>
            <Match when={projects.isSuccess && projects.data}>
              {(data) => (
                <For
                  each={data()}
                  fallback={
                    <div class="col-span-full flex flex-col items-center justify-center rounded-md p-20 gap-8">
                      <h3 class="text-xl font-bold select-none">No projects found.</h3>
                      <p class="text-md font-medium select-none">
                        Ötzi has currently no public projects. These will be updated at some point.
                      </p>
                    </div>
                  }
                >
                  {(project) => <PublicProject project={project} />}
                </For>
              )}
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
}
