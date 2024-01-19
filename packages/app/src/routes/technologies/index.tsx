import { A } from "solid-start";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Show, Switch } from "solid-js";
import { isLoggedIn } from "~/components/providers/Auth";
import { Queries } from "~/utils/api/queries";

export default function ProjectConfigurationTechnologiesPage() {
  const technologies = createQuery(() => ({
    queryKey: ["technologies"],
    queryFn: () => Queries.technologies(),
  }));

  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl font-bold select-none">Technologies</h1>
        <Show when={isLoggedIn()}>
          <A
            href="./add"
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
        </Show>
      </div>
      <Switch fallback={<div>404</div>}>
        <Match when={technologies.isSuccess && technologies.data}>
          {(tech) => (
            <For
              each={tech()}
              fallback={
                <div class="col-span-full w-full flex flex-col gap-4 bg-neutral-100 dark:bg-neutral-900 p-8 rounded-md items-center justify-center border border-neutral-300 dark:border-neutral-800 shadow-sm">
                  <Show when={isLoggedIn()}>
                    <A
                      href="./add"
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
                  </Show>
                </div>
              }
            >
              {(tech) => (
                <div class="flex flex-col gap-1">
                  <h5 class="text-md font-bold">{tech.name}</h5>
                  <p class="text-md font-medium">{tech.description}</p>
                </div>
              )}
            </For>
          )}
        </Match>
      </Switch>
    </main>
  );
}
