import { A } from "@solidjs/router";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";
import Highlight from "./CodePreview";
import { useAuth } from "./providers/OfflineFirst";

type ConfigureProjectConstructsProps = {
  projectId: string;
};

export const ConfigureProjectConstructs = (props: ConfigureProjectConstructsProps) => {
  const [user] = useAuth();
  const quertClient = useQueryClient();
  const project = createQuery(
    () => ["project", props.projectId],
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.project(token, props.projectId);
    },
    {
      get enabled() {
        const u = user();
        // const token = u.token;
        return !u.isLoading && u.isAuthenticated;
      },
      refetchInterval: 0,
      refetchOnWindowFocus: false,
    }
  );

  const syncProject = createMutation(
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Mutations.Projects.syncOne(token, props.projectId);
    },
    {
      async onSuccess() {
        await quertClient.invalidateQueries(["analysis", props.projectId]);
      },
    }
  );

  const [expandedConstructs, setExpandedConstructs] = createSignal<string[]>([]);

  return (
    <div class="w-full flex flex-col gap-4">
      <Switch
        fallback={
          <div class="w-full flex flex-col gap-2.5">
            <div class="w-full flex flex-col gap-6">
              <div class="w-full flex flex-row items-center justify-between">
                <div class="w-[200px] h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                <div class="flex flex-row items-center gap-2.5">
                  <div class="w-[80px] h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                </div>
              </div>
              <div class="w-full flex flex-col items-center">
                <For each={[...Array(5).keys()]}>
                  {() => (
                    <div class="w-full p-5 rounded-sm border border-neutral-100 dark:border-neutral-800 animate-pulse border-b-0 last:border-b first:rounded-t-md last:rounded-b-md">
                      <div class="w-full flex flex-row items-center justify-between gap-2.5">
                        <div class="flex flex-row items-center gap-2.5">
                          <div class="w-4 h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                          <div class="w-[150px] h-4 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                        </div>
                        <div class="flex flex-row items-center gap-2.5">
                          <div class="w-[80px] h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                          <div class="w-[80px] h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        }
      >
        <Match when={!project.isLoading && project.isSuccess && project.data}>
          {(data) => (
            <div class="w-full flex flex-col gap-8">
              <div class="w-full flex flex-col gap-4">
                <div class="w-full flex flex-row items-start justify-between">
                  <div class="flex flex-col gap-2">
                    <span class="text-3xl font-medium">{data().name}</span>
                  </div>
                  <div class="flex flex-row items-center gap-2.5">
                    <button
                      class="bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 rounded-md active:bg-neutral-800 active:text-white dark:hover:bg-neutral-100 dark:active:bg-neutral-200 px-2.5 py-1 items-center flex flex-row gap-2.5"
                      disabled={syncProject.isLoading}
                      onClick={async () => {
                        await syncProject.mutateAsync();
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
                        class={cn({
                          "animate-spin": syncProject.isLoading,
                        })}
                      >
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                      </svg>
                      <span class="font-medium">Sync</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="w-full flex flex-col gap-4">
                <div class="w-full flex flex-col font-bold overflow-clip text-sm">
                  <Show
                    fallback={
                      <div class="w-full flex flex-col gap-2.5 border border-neutral-200 dark:border-neutral-800 p-10 items-center justify-center">
                        <span class="text-lg font-medium">No Constructs found.</span>
                      </div>
                    }
                    when={
                      typeof project.data?.analysis !== "undefined" &&
                      typeof project.data?.analysis.constructs !== "undefined" &&
                      Object.entries(project.data?.analysis.constructs ?? {})
                    }
                  >
                    {(constructs) => (
                      <For each={constructs()}>
                        {([name, construct]) => (
                          <div
                            class={cn(
                              "p-3 w-full flex flex-col gap-2.5 border border-neutral-200 dark:border-neutral-800 items-center justify-between border-b-0 last:border-b transition-all duration-300 h-auto overflow-clip",
                              {
                                "text-teal-500": typeof construct !== "boolean",
                              }
                            )}
                          >
                            <Switch>
                              <Match when={typeof construct === "boolean"}>
                                <div class="w-full flex flex-row items-center justify-between">
                                  <div class="flex flex-row items-center gap-2.5">
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
                                    {name}
                                  </div>
                                  <button
                                    disabled
                                    class="bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md active:bg-neutral-200 dark:active:bg-neutral-800 px-2.5 py-1 items-center flex flex-row gap-2.5 text-black dark:text-white w-max disabled:opacity-20 disabled:cursor-not-allowed"
                                  >
                                    <span>Link Coming soon</span>
                                  </button>
                                </div>
                              </Match>
                              <Match when={typeof construct === "object" && construct}>
                                {(c) => (
                                  <>
                                    <div class="w-full flex flex-col justify-between">
                                      <div class="w-full items-center flex flex-row gap-2.5 justify-between">
                                        <div class="flex flex-row gap-2.5 items-center">
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
                                          <span>{name}</span>
                                        </div>
                                        <div class="flex flex-row gap-2.5 items-center">
                                          <button
                                            class="rounded-md bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-800 flex flex-row items-center justify-center px-2.5 py-1 text-black dark:text-white w-max border border-neutral-200 dark:border-neutral-800"
                                            onClick={(e) => {
                                              if (typeof construct === "object" && construct) {
                                                const id = construct.id;
                                                if (expandedConstructs().includes(id)) {
                                                  setExpandedConstructs((prev) => prev.filter((i) => i !== id));
                                                } else {
                                                  setExpandedConstructs((prev) => [...prev, id]);
                                                }
                                              }
                                            }}
                                          >
                                            <Switch
                                              fallback={
                                                <div class="flex flex-row gap-2.5 items-center">
                                                  <span>Expand</span>
                                                </div>
                                              }
                                            >
                                              <Match when={expandedConstructs().includes(c().id)}>
                                                <div class="flex flex-row gap-2.5 items-center">
                                                  <span>Close</span>
                                                </div>
                                              </Match>
                                            </Switch>
                                          </button>
                                          <A
                                            target="_blank"
                                            href={c().href}
                                            class="bg-white dark:bg-black hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md active:bg-neutral-200 dark:active:bg-neutral-800 px-2.5 py-1 items-center flex flex-row gap-2.5 text-black dark:text-white w-max"
                                          >
                                            <span>More Info</span>
                                          </A>
                                        </div>
                                      </div>

                                      <div
                                        class={cn(
                                          "w-full flex flex-col gap-2.5 text-black dark:text-white overflow-clip",
                                          {
                                            hidden: !expandedConstructs().includes(c().id),
                                          }
                                        )}
                                      >
                                        <div class="w-full flex flex-row items-center gap-2.5">
                                          <span class="font-bold">Type:</span>
                                          <span>{c().type}</span>
                                        </div>
                                        <div class="w-full flex flex-row items-center gap-2.5">
                                          <span class="font-bold">Href:</span>
                                          <span>{c().href}</span>
                                        </div>
                                        <div class="w-full flex flex-row items-center gap-2.5">
                                          <span class="font-bold">Source:</span>
                                          <A
                                            href={`${project.data?.remote}/tree/main/${c().meta.file}#L${
                                              c().meta.line
                                            }`}
                                            target="_blank"
                                            rel="external"
                                            class="text-teal-500"
                                          >
                                            {c().meta.file} - line: {c().meta.line}
                                          </A>
                                        </div>
                                        <div class="w-full flex flex-col gap-2.5">
                                          <span class="font-bold">Import:</span>
                                          <pre>
                                            <Highlight class="w-full p-4" language="typescript">
                                              {c().meta.import}
                                            </Highlight>
                                          </pre>
                                        </div>
                                        <div class="w-full flex flex-col gap-2.5">
                                          <h3 class="font-bold">Used for:</h3>
                                          <pre>
                                            <Highlight class="w-full p-4" language="typescript">
                                              {c().meta.code.join("\n")}
                                            </Highlight>
                                          </pre>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </Match>
                            </Switch>
                          </div>
                        )}
                      </For>
                    )}
                  </Show>
                </div>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
};
