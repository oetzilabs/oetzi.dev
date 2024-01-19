import { A, redirect, useParams } from "solid-start";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { isLoggedIn } from "~/components/providers/Auth";
import { Queries } from "~/utils/api/queries";

export default function ProjectConfigurationPage() {
  const { id } = useParams();
  if (!id) return redirect("/notfound", { status: 404 });

  const project = createQuery(() => ({
    queryKey: ["project", id],
    queryFn: () => Queries.project(id),
  }));

  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <Switch fallback={<div>404</div>}>
        <Match when={isLoggedIn() && project.isSuccess && project.data}>
          {(project) => (
            <div class="flex flex-col w-full gap-4">
              <div class="flex flex-row items-center justify-between">
                <span class="text-2xl font-medium">Configuration for {project().name}</span>
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex flex-row items-center justify-between">
                  <span class="text-xl font-medium text-neutral-800 dark:text-neutral-300">Tech Stack</span>
                </div>
                <div class="grid grid-cols-4 w-full">
                  <For
                    each={project().techsByProject}
                    fallback={
                      <div class="col-span-full w-full flex flex-col gap-4 bg-neutral-100 dark:bg-neutral-900 p-8 rounded-md items-center justify-center border border-neutral-300 dark:border-neutral-800 shadow-sm">
                        <span class="text-md font-medium">This Project is unconfigured.</span>
                        <A
                          href="./technologies"
                          class="flex flex-row items-center justify-center gap-2 text-sm bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black px-3 py-1 rounded-lg font-medium shadow-sm hover:bg-neutral-800 dark:hover:bg-neutral-200"
                        >
                          <span>Add Technology</span>
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
                        </A>
                      </div>
                    }
                  >
                    {(tech) => (
                      <div class="flex flex-col gap-1">
                        <h5 class="text-md font-bold">{tech.tech.name}</h5>
                        <p class="text-md font-medium">{tech.tech.description}</p>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </main>
  );
}
