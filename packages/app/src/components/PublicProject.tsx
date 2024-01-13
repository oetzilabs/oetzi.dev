import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, Match, Show, Switch } from "solid-js";
import * as Projects from "../../../core/src/entities/projects";
import { Project } from "../utils/api/project";
import { A, action } from "@solidjs/router";
import { Session } from "../utils/api/session";
dayjs.extend(relativeTime);

type PublicProjectProps = {
  project: Projects.Frontend;
};

export const PublicProject = (props: PublicProjectProps) => {
  const isLoggedIn = Session.isLoggedIn();
  const deleteProject = action(Project.remove);
  return (
    <div class="flex flex-col text-black dark:text-white border border-neutral-300 dark:border-neutral-800 overflow-clip">
      <div class="flex flex-row items-center justify-between p-4 pb-2">
        <div class="w-full flex flex-row items-center justify-between gap-2.5" title={props.project.visibility}>
          <h3 class="text-xl font-bold ">{props.project.name}</h3>
          <div class="flex flex-row items-center gap-2.5">
            <Show when={isLoggedIn() && isLoggedIn()}>
              <form action={deleteProject} method="post">
                <input type="hidden" name="id" value={props.project.id} />
                <button type="submit" class="flex flex-row gap-2.5 text-rose-500">
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
                </button>
              </form>
            </Show>
          </div>
        </div>
        <div class="flex flex-row items-center gap-2.5"></div>
      </div>
      <p class="text-md p-4 pt-2 border-b border-neutral-300 dark:border-neutral-800 ">{props.project.description}</p>
      <div class="flex flex-col gap-2 p-4 border-b border-neutral-300 dark:border-neutral-800">
        <Switch>
          <Match when={props.project.techsByProject && props.project.techsByProject}>
            {(tech) => (
              <div class="flex flex-col gap-2">
                <div class="grid grid-cols-2">
                  <For
                    each={tech().map((tech) => tech.tech)}
                    fallback={
                      <div class="col-span-full w-full flex flex-col gap-6 bg-neutral-100 dark:bg-neutral-900 p-8 rounded-md items-center justify-center border border-neutral-300 dark:border-neutral-800">
                        <span>This Project is unconfigured.</span>
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
                </div>
              </div>
            )}
          </Match>
          <Match when={props.project.techsByProject.length === 0}>
            <div class="w-full flex flex-col gap-6 bg-neutral-100 dark:bg-neutral-900 p-8 rounded-md items-center justify-center border border-neutral-300 dark:border-neutral-800">
              <span>This Project is unconfigured.</span>
            </div>
          </Match>
        </Switch>
      </div>
      <div class="flex flex-col gap-1 p-4 border-b border-neutral-300 dark:border-neutral-800">
        <div class="flex flex-row items-center justify-between gap-2.5">
          <span class="text-md font-medium ">Created {dayjs(props.project.createdAt).fromNow()}</span>
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
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </div>
      </div>
      <div class="flex flex-col gap-1 ">
        <div class="flex flex-row items-center justify-between gap-2.5">
          <A
            href={props.project.remote!}
            target="_blank"
            rel="noopener noreferrer external"
            class="flex flex-row gap-2.5 w-full text-md font-medium  items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-950"
          >
            <span>Open in new Tab</span>
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
