import { DropdownMenu } from "@kobalte/core";
import { A } from "@solidjs/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Match, Show, Switch } from "solid-js";
import { useNavigate } from "@solidjs/router";
import * as Projects from "../../../core/src/entities/projects";
import * as Users from "../../../core/src/entities/users";
import { cn } from "../utils/cn";
dayjs.extend(relativeTime);

type ProjectProps = {
  project: Projects.Frontend | Users.Frontend["projects"][number];
  confirmRemoveProject: (id: string) => void;
  isDeleting?: boolean;
};

export const Project = (props: ProjectProps) => {
  const isDeleting = props.isDeleting ?? false;
  const navigator = useNavigate();
  return (
    <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-950 leading-none border-b border-neutral-200 dark:border-neutral-800 w-full py-2">
      <td class="p-4 w-min py-3" title={props.project.visibility}>
        <div
          class={cn("p-2 flex flex-row items-center w-min rounded-sm", {
            "bg-rose-100 dark:bg-rose-900/40": props.project.visibility === "private",
            "bg-teal-100 dark:bg-teal-950/40": props.project.visibility === "public",
          })}
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
            class={cn({
              "text-rose-500": props.project.visibility === "private",
              "text-teal-500": props.project.visibility === "public",
            })}
          >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        </div>
      </td>
      <td class="p-4 " title={props.project.description ?? ""}>
        <A class="hover:underline hover:underline-offset-2" href={`/project/${props.project.id}`}>
          {props.project.name}
        </A>
      </td>
      <td class="px-2 space-x-2 text-right">
        <Switch>
          <Match when={props.project.stack && props.project.stack}>
            {(stack) => (
              <For
                each={stack()
                  .usedByTechnologies.map((ubt) => ubt.technology)
                  .flat()}
              >
                {(tech) => (
                  <div class="flex flex-col gap-1 w-max">
                    <h5 class="text-md font-bold">{tech.name}</h5>
                    <p class="text-md font-medium">{tech.description}</p>
                  </div>
                )}
              </For>
            )}
          </Match>
          <Match when={!props.project.stack}>
            <span class="text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-950 px-2 py-1 rounded-[3px] select-none border border-neutral-200 dark:border-neutral-900">
              unconfigured
            </span>
          </Match>
        </Switch>
      </td>
      <td class="p-4 text-right select-none">{dayjs(props.project.updatedAt || props.project.createdAt).fromNow()}</td>
      <td class="p-4 flex flex-row items-center justify-end">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger class="flex flex-row gap-2.5 items-center justify-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 rounded-sm cursor-pointer">
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
            <DropdownMenu.Content class="z-50 ml-1 self-end w-fit bg-white dark:bg-black rounded-sm border border-neutral-300 dark:border-neutral-800 shadow-md overflow-clip">
              <DropdownMenu.Item
                class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]"
                onSelect={() => {
                  navigator(`/project/${props.project.id}/edit`);
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
                  navigator(`/project/${props.project.id}/configure/constructs`);
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
                  navigator(`/project/${props.project.id}/duplicate`);
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
      </td>
    </tr>
  );
};
