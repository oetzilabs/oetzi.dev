import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Match, Show, Switch } from "solid-js";
import * as Projects from "../../../core/src/entities/projects";
import { A } from "@solidjs/router";
dayjs.extend(relativeTime);

type PublicProjectProps = {
  project: Projects.Frontend;
};

export const PublicProject = (props: PublicProjectProps) => {
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
        <div class="flex flex-row items-center gap-2.5"></div>
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
            </div>
          </Match>
        </Switch>
      </div>
      <div class="flex flex-col gap-1 p-4 border-b border-neutral-300 dark:border-neutral-800">
        <div class="flex flex-row items-center justify-between gap-2.5">
          <span class="text-md font-medium select-none">Created since {dayjs(props.project.createdAt).fromNow()}</span>
          <div class="w-3 h-3 rounded-full bg-teal-500"></div>
        </div>
      </div>
      <div class="flex flex-col gap-1 ">
        <div class="flex flex-row items-center justify-between gap-2.5">
          <A
            href={props.project.remote}
            target="_blank"
            rel="noopener noreferrer external"
            class="flex flex-row gap-2.5 w-full text-md font-medium select-none items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-950"
          >
            <span>Open in {new URL(props.project.remote).hostname}</span>
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
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </A>
        </div>
      </div>
    </div>
  );
};
