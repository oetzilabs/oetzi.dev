import { Switch, Match, For, Show } from "solid-js";
import * as Projects from "../../../core/src/entities/projects";
import * as Users from "../../../core/src/entities/users";
import { cn } from "../utils/cn";
import { DropdownMenu } from "@kobalte/core";
import DuplicateProject from "./DuplicateProject";
import { useNavigate } from "solid-start";
import { A } from "@solidjs/router";

type ProjectProps = {
  project: Projects.Frontend | Users.Frontend["projects"][number];
  confirmRemoveProject: (id: string) => void;
  withMenu?: boolean;
  isDeleting?: boolean;
};

export const Project = (props: ProjectProps) => {
  const withMenu = props.withMenu ?? false;
  const isDeleting = props.isDeleting ?? false;
  const navigator = useNavigate();
  return (
    <div class="flex flex-col  text-black dark:text-white rounded-md border border-neutral-200 dark:border-neutral-800 overflow-clip">
      <div
        class={cn("flex w-full text-xs p-1 items-center justify-center", {
          "bg-teal-100 dark:bg-teal-950 text-teal-500": props.project.visibility === "public",
          "bg-rose-100 dark:bg-rose-950 text-rose-500": props.project.visibility === "private",
        })}
      >
        {props.project.visibility}
      </div>
      <div class="flex flex-row items-center justify-between p-4 pb-2">
        <h3 class="text-xl font-bold">{props.project.name}</h3>
        <div class="flex flex-row items-center gap-2.5">
          <Show when={withMenu}>
            <DropdownMenu.Root placement="right-start">
              <DropdownMenu.Trigger class="flex flex-row gap-2.5 items-center justify-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 rounded-md cursor-pointer">
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
                  class="lucide lucide-more-horizontal"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content class="z-50 ml-1 self-end w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                  <DropdownMenu.Item class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]">
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
                      class="lucide lucide-pencil"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                    <span>Edit</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]"
                    onSelect={() => {
                      navigator(`/dashboard/project/duplicate/${props.project.id}`);
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
                      class="lucide lucide-copy-plus"
                    >
                      <line x1="15" x2="15" y1="12" y2="18" />
                      <line x1="12" x2="18" y1="15" y2="15" />
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Duplicate</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator class="border-neutral-200 dark:border-neutral-800" />
                  <DropdownMenu.Item
                    class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 active:bg-red-100 dark:active:bg-red-800 font-medium items-center justify-start select-none min-w-[150px] text-red-500 dark:text-red-400 dark:hover:text-white dark:active:text-white"
                    disabled={isDeleting}
                    onSelect={() => props.confirmRemoveProject(props.project.id)}
                    aria-label="Delete Project"
                  >
                    <Show
                      when={isDeleting}
                      fallback={
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
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" x2="10" y1="11" y2="17" />
                          <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                      }
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
                        class="animate-spin"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </Show>
                    <span>Delete</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </Show>
        </div>
      </div>
      <p class="text-md p-4 pt-2 border-b border-neutral-200 dark:border-neutral-800">{props.project.description}</p>
      <div class="flex flex-col gap-2 p-4 border-b border-neutral-200 dark:border-neutral-800">
        <Switch>
          <Match when={props.project.stack && props.project.stack}>
            {(stack) => (
              <div class="flex flex-col gap-2">
                <div class="grid grid-cols-2">
                  <For
                    each={stack()
                      .usedByTechnologies.map((ubt) => ubt.technology)
                      .flat()}
                  >
                    {(tech) => (
                      <div class="flex flex-col gap-1">
                        <h5 class="text-md font-bold">{tech.name}</h5>
                        <p class="text-md font-medium">{tech.description}</p>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </Match>
          <Match when={!props.project.stack}>
            <div class="w-full flex flex-col gap-6 bg-neutral-100 dark:bg-neutral-900 p-8 rounded-md items-center justify-center border border-neutral-200 dark:border-neutral-800">
              <span>This Project is not configured yet.</span>
              <div class="flex flex-row items-center justify-center gap-2.5">
                <A
                  href={`/dashboard/project/configure/${props.project.id}`}
                  class="bg-black dark:bg-white rounded-md text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 active:bg-black/90 dark:active:bg-white/90 px-2 py-1 font-bold flex flex-row items-center justify-center gap-2.5"
                  aria-label="Configure Stack"
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
                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="M12 2v2" />
                    <path d="M12 22v-2" />
                    <path d="m17 20.66-1-1.73" />
                    <path d="M11 10.27 7 3.34" />
                    <path d="m20.66 17-1.73-1" />
                    <path d="m3.34 7 1.73 1" />
                    <path d="M14 12h8" />
                    <path d="M2 12h2" />
                    <path d="m20.66 7-1.73 1" />
                    <path d="m3.34 17 1.73-1" />
                    <path d="m17 3.34-1 1.73" />
                    <path d="m11 13.73-4 6.93" />
                  </svg>
                  <span>Configure</span>
                </A>
              </div>
            </div>
          </Match>
        </Switch>
      </div>
      <div class="flex flex-col gap-1 p-4">
        <div class="flex flex-row items-center justify-between gap-2.5">
          <span class="text-md font-medium">Online</span>
          <div class="w-3 h-3 rounded-full bg-teal-500"></div>
        </div>
      </div>
    </div>
  );
};
