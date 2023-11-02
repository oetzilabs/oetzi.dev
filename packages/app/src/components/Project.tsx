import { DropdownMenu } from "@kobalte/core";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Match, Show, Switch } from "solid-js";
import { useNavigate } from "solid-start";
import * as Projects from "../../../core/src/entities/projects";
import * as Users from "../../../core/src/entities/users";
dayjs.extend(relativeTime);

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
    <div class="flex flex-col text-black dark:text-white border border-neutral-300 dark:border-neutral-800 overflow-clip">
      <div class="flex flex-row items-center justify-between p-4 pb-2">
        <div class="flex flex-row items-center gap-2.5" title={props.project.visibility}>
          <Show
            when={props.project.visibility === "public"}
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
                class="text-rose-500"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
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
              class="text-teal-500"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Show>
          <h3 class="text-xl font-bold select-none">{props.project.name}</h3>
        </div>
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
                <DropdownMenu.Content class="z-50 ml-1 self-end w-fit bg-white dark:bg-black rounded-md border border-neutral-300 dark:border-neutral-800 shadow-md overflow-clip">
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
                      navigator(`/dashboard/project/configure/${props.project.id}/constructs`);
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
                    >
                      <path d="m7.5 4.27 9 5.15" />
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                    <span>Constructs</span>
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
                  <DropdownMenu.Separator class="border-neutral-300 dark:border-neutral-800" />
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
      <p class="text-md p-4 pt-2 border-b border-neutral-300 dark:border-neutral-800 select-none">
        {props.project.description}
      </p>
      <div class="flex flex-col gap-2 p-4 border-b border-neutral-300 dark:border-neutral-800">
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
            <div class="w-full flex flex-col gap-6 bg-neutral-100 dark:bg-neutral-900 p-8 rounded-md items-center justify-center border border-neutral-300 dark:border-neutral-800">
              <span>This Project is unconfigured.</span>
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
          <span class="text-md font-medium select-none">
            Online since {dayjs(props.project.updatedAt || props.project.createdAt).fromNow()}
          </span>
          <div class="w-3 h-3 rounded-full bg-teal-500"></div>
        </div>
      </div>
    </div>
  );
};
