import { A, redirect, useParams } from "solid-start";
import { Queries } from "../../../utils/api/queries";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";

export default function ProjectPage() {
  const { id } = useParams();
  if (!id) return redirect("/notfound", { status: 404 });
  const project = createQuery(() => ({
    queryKey: ["project", id],
    queryFn: () => Queries.project(id),
  }));
  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <Switch fallback={<div>404</div>}>
        <Match when={project.isSuccess && project.data}>
          {(project) => (
            <div class="flex flex-col w-full gap-4">
              <div class="flex flex-row items-center justify-between">
                <span class="text-2xl font-medium">{project().name}</span>
                <A
                  href={project().remote ?? "#"}
                  class="text-sm font-medium hover:underline bg-black dark:bg-white text-white dark:text-black rounded-md px-3 py-1 flex flex-row gap-2 items-center shadow-sm"
                  rel="noreferrer external"
                  target="_blank"
                >
                  <span>Open in new tab</span>
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
                    <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                    <path d="m21 3-9 9" />
                    <path d="M15 3h6v6" />
                  </svg>
                </A>
              </div>
              <div class="flex flex-row items-center justify-between">
                <span class="text-xl font-medium text-neutral-800 dark:text-neutral-300">Tech Stack</span>
              </div>
              <For
                each={project().techsByProject}
                fallback={
                  <div class="w-full flex flex-col gap-6 bg-neutral-100 dark:bg-neutral-900 p-14 rounded-md items-center justify-center border border-neutral-300 dark:border-neutral-800 shadow-sm">
                    <span class="text-md font-medium">There are currently no Technologies on this project set up</span>
                    <A
                      href={`./configure`}
                      class="bg-blue-200 dark:bg-blue-900 font-medium px-3 py-1 rounded-md border border-blue-300 dark:border-blue-800 hover:bg-blue-300 dark:hover:bg-blue-800 shadow-sm shadow-blue-200 dark:shadow-blue-900 text-sm"
                    >
                      Configure
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
          )}
        </Match>
      </Switch>
    </main>
  );
}
