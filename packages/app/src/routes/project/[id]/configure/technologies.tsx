import { Select } from "@kobalte/core";
import { redirect, useParams } from "solid-start";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { Queries } from "~/utils/api/queries";
import { Technologies } from "~/utils/api/technology";
import { isLoggedIn } from "../../../../components/providers/Auth";

export default function ProjectConfigurationTechnologiesPage() {
  const { id } = useParams();
  if (!id) return redirect("/notfound", { status: 404 });
  const project = createQuery(() => ({
    queryKey: ["project", id],
    queryFn: () => Queries.project(id),
  }));

  const [projectTechnologies, setProjectTechnologies] = createSignal<string[]>([]);

  createEffect(() => {
    if (project.isSuccess && project.data) {
      setProjectTechnologies(project.data.techsByProject.map((t) => t.tech.id));
    }
  });

  const technologies = createQuery(() => ({
    queryKey: ["technologies"],
    queryFn: () => Queries.technologies(),
  }));

  const addTech = createMutation(() => ({
    mutationFn: (props: { name: string; description: string }) => Technologies.create(props),
    mutationKey: ["addTechToProject", id],
  }));

  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <Switch fallback={<div>404</div>}>
        <Match when={project.isSuccess && project.data}>
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
                        <Show when={isLoggedIn()}>
                          <Select.Root
                            options={
                              technologies.isSuccess && technologies.data
                                ? technologies.data.map((t) => ({ label: t.name, value: t.id }))
                                : []
                            }
                            itemComponent={(props) => (
                              <Select.Item
                                item={props.item}
                                class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium select-none min-w-[150px] items-center justify-between"
                              >
                                <Select.ItemLabel class="capitalize">{props.item.rawValue.label}</Select.ItemLabel>
                                <Select.ItemIndicator class="">
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
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </Select.ItemIndicator>
                              </Select.Item>
                            )}
                          >
                            <Select.Trigger>
                              <div class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800 flex flex-row gap-2 items-center justify-center">
                                <Select.Value<string> class="font-bold select-none capitalize">
                                  {(state) => state.selectedOption()}
                                </Select.Value>
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
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </div>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content class="z-50 self-end w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                                <Select.Listbox />
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </Show>
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
