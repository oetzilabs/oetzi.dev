import { Select, Tabs, TextField } from "@kobalte/core";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";
import { useAuth } from "./providers/OfflineFirst";
import { useNavigate } from "@solidjs/router";

const DefaultProject = {
  name: "",
  description: "",
  protected: "",
  visibility: "private",
  org: "",
} as Parameters<typeof Mutations.Projects.create>[1];

export default function NewProject() {
  const [user] = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createProject = createMutation(
    async (input: Parameters<typeof Mutations.Projects.create>[1]) => {
      let u = user();
      if (!u) return;
      if (!u.isAuthenticated) return;
      if (!u.token) return;

      return Mutations.Projects.create(u.token, input);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["projects"]);
      },
    }
  );

  const [project, setProject] = createSignal<Parameters<typeof Mutations.Projects.create>[1]>(DefaultProject);

  const organizations = createQuery(
    () => ["organizations"],
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.organizations(token);
    },
    {
      get enabled() {
        const u = user();
        return !u.isLoading && u.isAuthenticated && u.token !== null;
      },
      refetchInterval: 60_000,
      refetchOnWindowFocus: false,
    }
  );

  const isAvailableRepositoryName = (name: string) => {
    let repos: string[] = [];
    if (organizations.isSuccess) {
      repos = Object.values(organizations.data)
        .map((org) => org.repos.map((r) => r.name))
        .flat();
    }
    const organization = project().org;
    if (organization.length === 0) return false;
    return !repos.includes(name);
  };

  createEffect(() => {
    // use the first organization as the default after it got loaded, and if the project has no org
    if (organizations.isSuccess && project().org.length === 0) {
      setProject({ ...project(), org: Object.keys(organizations.data ?? {})[0] ?? "" });
    }
  });

  const templates = createQuery(
    () => ["templates"],
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return [
        {
          id: "1",
          name: "Restaurant",
          description: "A template for a restaurant website",
          preview:
            "https://media.istockphoto.com/photos/cafe-restaurant-interior-with-table-blur-abstract-background-with-picture-id1133468340?k=6&m=1133468340&s=612x612&w=0&h=2Eg_JOInCgswKFAu3olUi8x8yzwOuppoFayHMu0NUOk=",
        },
      ];
    },
    {
      get enabled() {
        const u = user();
        return !u.isLoading && u.isAuthenticated && u.token !== null;
      },
    }
  );

  const [textAreaHeight, setTextAreaHeight] = createSignal(50);

  createEffect(() => {
    const textArea = document.querySelector("textarea");
    if (!textArea) return;
    textArea.addEventListener("input", (e) => {
      const height = textArea.scrollHeight;
      setTextAreaHeight(height);
    });
  });

  const [selectedTemplate, setSelectedTemplate] = createSignal<string | null>(null);

  return (
    <Show when={user().isAuthenticated}>
      <div class="w-full flex flex-col gap-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          class="flex flex-col w-full h-[90dvh]"
        >
          <div class="relative h-full w-full py-32 flex flex-col items-center">
            <div class="absolute container aspect-video border border-neutral-200 dark:border-neutral-800 rounded-t-2xl bg-neutral-50 dark:bg-neutral-950 flex">
              <Show
                when={selectedTemplate() === null}
                fallback={
                  <div class="w-full h-full overflow-clip rounded-t-2xl">
                    <img
                      src={templates.data?.find((x) => x.id === selectedTemplate())!.preview}
                      class="object-cover w-full h-full opacity-70"
                    />
                  </div>
                }
              >
                <div class="absolute top-1/4 translate-y-2 w-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 font-medium">
                  Please choose a Template below
                </div>
              </Show>
              <div class="fixed z-0 left-0 top-[50%] h-[50dvh] bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 p-10 w-full flex flex-col shadow-[0px_-20px_60px_0px_rgba(0,0,0,0.03)] dark:shadow-[0px_-20px_60px_0px_rgba(0,0,0,0.5)]">
                <div class="container mx-auto flex flex-col gap-8 h-full">
                  <Show
                    when={organizations.isSuccess}
                    fallback={
                      <Switch>
                        <Match when={organizations.isLoading}>
                          <div class="flex flex-row gap-2.5">
                            <div class="flex items-center justify-center w-[100px] bg-neutral-100 dark:bg-neutral-800 animate-pulse h-6 rounded-sm"></div>{" "}
                            <div class="flex items-center justify-center w-[100px] bg-neutral-100 dark:bg-neutral-800 animate-pulse h-6 rounded-sm"></div>
                          </div>
                        </Match>
                        <Match when={organizations.isError}>
                          <div class="flex flex-row items-center justify-center bg-white dark:bg-black rounded-md border border-red-500 p-2 py-1 w-max">
                            <span class="text-red-500 w-max">Error</span>
                          </div>
                        </Match>
                      </Switch>
                    }
                  >
                    <div class="flex flex-row items-center justify-between gap-2.5">
                      <Switch>
                        <Match when={Object.keys(organizations.data ?? {}).length === 0}>
                          <div class="flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded-md border border-neutral-100 dark:border-neutral-900 p-2 py-1 w-max gap-2.5 select-none">
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
                              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                              <path d="M10 6h4" />
                              <path d="M10 10h4" />
                              <path d="M10 14h4" />
                              <path d="M10 18h4" />
                            </svg>
                            <span class="">No organizations</span>
                          </div>
                        </Match>
                        <Match when={!organizations.isError}>
                          <div class="flex flex-row items-center gap-2.5">
                            <div class="p-3 py-1 w-full bg-teal-200/50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-950 rounded-sm flex flex-row gap-2 items-center justify-center text-sm font-bold">
                              {project().org}
                            </div>
                            <Select.Root
                              defaultValue={"private" as Parameters<typeof Mutations.Projects.create>[1]["visibility"]}
                              value={project().visibility}
                              disabled={organizations.isLoading || project().org.length === 0}
                              placeholder="Select a visibility"
                              onChange={(i) => {
                                setProject({ ...project(), visibility: i });
                              }}
                              name="repositoy-visiblity"
                              placement="bottom-start"
                              required
                              options={
                                ["private", "public"] as Parameters<typeof Mutations.Projects.create>[1]["visibility"][]
                              }
                              itemComponent={(props) => (
                                <Select.Item
                                  item={props.item}
                                  class="flex flex-row gap-2.5 p-3 py-1 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium select-none min-w-[150px] items-center justify-between text-sm focus:ring-0 focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-900"
                                >
                                  <Select.ItemLabel class="capitalize">{props.item.rawValue}</Select.ItemLabel>
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
                              <div class="flex flex-col gap-0.5 w-max">
                                <Select.Trigger>
                                  <div class="p-3 py-1 w-full bg-neutral-200 dark:bg-neutral-900 rounded-sm flex flex-row gap-2 items-center justify-center text-sm font-bold border border-neutral-300 dark:border-neutral-800">
                                    <Select.Value<
                                      Parameters<typeof Mutations.Projects.create>[1]["visibility"]
                                    > class="font-bold select-none capitalize">
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
                              </div>
                            </Select.Root>
                          </div>
                          <div class="flex flex-row items-center gap-2.5">
                            <button
                              disabled={
                                organizations.isLoading ||
                                project().org.length === 0 ||
                                !isAvailableRepositoryName(project().name) ||
                                createProject.isLoading ||
                                project().name.length === 0
                              }
                              type="button"
                              class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black w-full disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={async () => {
                                const p = project();
                                const createdProject = await createProject.mutateAsync(p);
                                if (!createdProject) return;
                                navigate(`/project/${createdProject.id}`);
                              }}
                            >
                              <Show
                                when={createProject.isLoading}
                                fallback={<span class="font-bold select-none">Create</span>}
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
                                <span class="font-bold select-none">Creating</span>
                              </Show>
                            </button>
                          </div>
                        </Match>
                      </Switch>
                    </div>
                  </Show>
                  <TextField.Root
                    required
                    class="w-full flex flex-col gap-0.5"
                    value={project().name}
                    name="repositoy-name"
                    onChange={(name) => {
                      setProject({ ...project(), name });
                    }}
                  >
                    <TextField.Input
                      disabled={organizations.isLoading || project().org.length === 0}
                      placeholder="Project Name"
                      autofocus
                      class={cn(
                        "w-full bg-transparent font-bold text-3xl focus-visible:ring-0 focus-visible:outline-none",
                        {
                          "text-rose-600": !isAvailableRepositoryName(project().name),
                          "text-black dark:text-white": isAvailableRepositoryName(project().name),
                        }
                      )}
                    />
                  </TextField.Root>
                  <TextField.Root
                    class="w-full flex flex-col gap-0.5"
                    value={project().description}
                    onChange={(description) => {
                      setProject({ ...project(), description });
                    }}
                    name="repositoy-description"
                  >
                    <TextField.TextArea
                      disabled={organizations.isLoading || project().org.length === 0}
                      placeholder="What should the repository be known for?"
                      class="w-full bg-transparent focus-visible:ring-0 focus-visible:outline-none resize-y"
                      style={{ height: `${textAreaHeight()}px` }}
                    />
                  </TextField.Root>
                  <hr class="w-full border-neutral-200 dark:border-neutral-800" />
                  <h1 class="font-bold text-2xl flex gap-1">
                    Templates<span class="text-red-500">*</span>
                  </h1>
                  <div class="grid grid-cols-4 gap-2.5">
                    <For each={templates.isSuccess && templates.data}>
                      {(template) => (
                        <div
                          class={cn(
                            "flex flex-col rounded-sm p-4 border border-neutral-200 dark:border-neutral-800 gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/50 cursor-pointer",
                            {
                              "border-teal-300 dark:border-teal-600": selectedTemplate() === template.id,
                            }
                          )}
                          onClick={() => {
                            setSelectedTemplate((prev) => (prev === template.id ? null : template.id));
                          }}
                        >
                          <span class="font-bold text-lg">{template.name}</span>
                          <span class="font-medium">{template.description}</span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Show>
  );
}
