import { Select, Tabs, TextField } from "@kobalte/core";
import { createMutation, createQuery, QueryClient, useQueryClient } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";
import { useAuth } from "./Auth";
import { Modal } from "./Modal";

const DefaultProject = {
  name: "",
  description: "",
  protected: "",
  visibility: "private",
  org: "",
} as Parameters<typeof Mutations.createProject>[1];

export default function NewProject() {
  const [user] = useAuth();
  const queryClient = useQueryClient();
  const createProject = createMutation(
    async (input: Parameters<typeof Mutations.createProject>[1]) => {
      let u = user();
      if (!u) return;
      if (!u.isAuthenticated) return;
      if (!u.token) return;

      return Mutations.createProject(u.token, input);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["projects"]);
        await queryClient.invalidateQueries(["user_projects"]);
      },
    }
  );

  const [modalOpen, setModalOpen] = createSignal(false);
  const [project, setProject] = createSignal<Parameters<typeof Mutations.createProject>[1]>(DefaultProject);

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

  type TabStep = "project" | "template" | "notifications" | "ci-cd" | "overview";

  const [currentTab, setCurrentTab] = createSignal<TabStep>("project");
  const tabSteps: {
    forward: Record<TabStep, TabStep | null>;
    backward: Record<TabStep, TabStep | null>;
  } = {
    forward: {
      project: "template",
      template: "notifications",
      notifications: "ci-cd",
      "ci-cd": "overview",
      overview: null,
    },
    backward: {
      project: null,
      template: "project",
      notifications: "template",
      "ci-cd": "notifications",
      overview: "ci-cd",
    },
  };

  createEffect(() => {
    // reset project if the modal is closed
    if (!modalOpen()) {
      setProject({ ...DefaultProject, org: Object.keys(organizations.data ?? {})[0] ?? "" });
      setCurrentTab("project");
    }
  });
  createEffect(() => {
    // use the first organization as the default after it got loaded, and if the project has no org
    if (organizations.isSuccess && project().org.length === 0) {
      setProject({ ...project(), org: Object.keys(organizations.data ?? {})[0] ?? "" });
    }
  });

  return (
    <Modal
      open={modalOpen()}
      onOpenChange={setModalOpen}
      title="Create a new project"
      trigger={
        <button
          class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black"
          onClick={() => {
            setProject({
              name: "",
              description: "",
              protected: "", // length 0 means no password
              visibility: "private",
              org: Object.keys(organizations.data ?? {})[0] ?? "",
            });
            setCurrentTab("project");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
          <span class="font-bold select-none">Create Project</span>
        </button>
      }
    >
      <div class="w-full flex flex-col gap-2.5 py-4">
        <Tabs.Root
          value={currentTab()}
          onChange={(v) => {
            setCurrentTab(v as TabStep);
          }}
          class="w-full flex flex-col gap-3 py-4"
        >
          <Tabs.List class="flex flex-row w-full pt-2">
            <Tabs.Trigger
              value={"project" as TabStep}
              class="border-neutral-100 dark:border-neutral-900 border-b-2 dark:ui-selected:border-b-white ui-selected:border-b-black py-1 px-2 font-medium ui-selected:font-bold"
            >
              Project
            </Tabs.Trigger>
            <Tabs.Trigger
              value={"stack" as TabStep}
              class="border-neutral-100 dark:border-neutral-900 border-b-2 dark:ui-selected:border-b-white ui-selected:border-b-black py-1 px-2 font-medium ui-selected:font-bold"
            >
              Stack
            </Tabs.Trigger>
            <Tabs.Trigger
              value={"notifications" as TabStep}
              class="border-neutral-100 dark:border-neutral-900 border-b-2 dark:ui-selected:border-b-white ui-selected:border-b-black py-1 px-2 font-medium ui-selected:font-bold"
            >
              Notifications
            </Tabs.Trigger>
            <Tabs.Trigger
              value={"ci-cd" as TabStep}
              class="border-neutral-100 dark:border-neutral-900 border-b-2 dark:ui-selected:border-b-white ui-selected:border-b-black py-1 px-2 font-medium ui-selected:font-bold"
            >
              CI/CD
            </Tabs.Trigger>
            <Tabs.Trigger
              value={"overview" as TabStep}
              class="border-neutral-100 dark:border-neutral-900 border-b-2 dark:ui-selected:border-b-white ui-selected:border-b-black py-1 px-2 font-medium ui-selected:font-bold"
            >
              Overview
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="project" class="flex flex-col gap-2.5 w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              class="flex flex-col gap-2.5 w-full"
            >
              <Show
                when={organizations.isSuccess}
                fallback={
                  <Switch>
                    <Match when={organizations.isLoading}>
                      <div class="flex items-center justify-center bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 p-2 py-1 w-[100px]">
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
                    <Select.Root
                      value={project().org}
                      placeholder="Select an organization"
                      onChange={(i) => {
                        if (!i) return;
                        setProject({ ...project(), org: i });
                      }}
                      placement="bottom-start"
                      required
                      options={Object.keys(organizations.data ?? {})}
                      disallowEmptySelection={false}
                      itemComponent={(props) => (
                        <Select.Item
                          item={props.item}
                          class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium select-none min-w-[150px] items-center justify-between"
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
                  </Match>
                </Switch>
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
                <TextField.Label class="text-sm font-medium">Name</TextField.Label>
                <TextField.Input
                  disabled={organizations.isLoading || project().org.length === 0}
                  placeholder="What should the repository be called?"
                  class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
                />
                <Show when={project().name.length > 0}>
                  <TextField.Description
                    class={cn("text-sm text-neutral-500 dark:text-neutral-400", {
                      "!text-red-500": !isAvailableRepositoryName(project().name),
                    })}
                  >
                    {!isAvailableRepositoryName(project().name)
                      ? "This name is already taken."
                      : "This name is available."}
                  </TextField.Description>
                </Show>
              </TextField.Root>
              <Select.Root
                defaultValue={"private" as Parameters<typeof Mutations.createProject>[1]["visibility"]}
                value={project().visibility}
                disabled={organizations.isLoading || project().org.length === 0}
                placeholder="Select a visibility"
                onChange={(i) => {
                  setProject({ ...project(), visibility: i });
                }}
                name="repositoy-visiblity"
                placement="bottom-start"
                required
                options={["private", "public"] as Parameters<typeof Mutations.createProject>[1]["visibility"][]}
                itemComponent={(props) => (
                  <Select.Item
                    item={props.item}
                    class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium select-none min-w-[150px] items-center justify-between"
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
                  <Select.Label class="text-sm font-medium">Visibility</Select.Label>
                  <Select.Trigger>
                    <div class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800 flex flex-row gap-2 items-center justify-center">
                      <Select.Value<
                        Parameters<typeof Mutations.createProject>[1]["visibility"]
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
              <TextField.Root
                class="w-full flex flex-col gap-0.5"
                value={project().description}
                onChange={(description) => {
                  setProject({ ...project(), description });
                }}
                name="repositoy-description"
              >
                <TextField.Label class="text-sm font-medium">Description</TextField.Label>
                <TextField.TextArea
                  disabled={organizations.isLoading || project().org.length === 0}
                  placeholder="What should the repository be known for?"
                  class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
                />
              </TextField.Root>
              <TextField.Root
                class="w-full flex flex-col gap-0.5"
                value={project().protected}
                name="repositoy-protected"
                onChange={(prot) => {
                  setProject({ ...project(), protected: prot });
                }}
              >
                <TextField.Label class="text-sm font-medium">Protected (password)</TextField.Label>
                <TextField.Input
                  disabled={organizations.isLoading || project().org.length === 0}
                  type="password"
                  placeholder=""
                  class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
                />
              </TextField.Root>
            </form>
          </Tabs.Content>
          <Tabs.Content value="stack" class="flex flex-col gap-2.5 w-full">
            <div class="flex flex-col gap-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-md p-10"></div>
          </Tabs.Content>
          <Tabs.Content value="notifications" class="flex flex-col gap-2.5 w-full">
            <div class="flex flex-col gap-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-md p-10"></div>
          </Tabs.Content>
          <Tabs.Content value="ci-cd" class="flex flex-col gap-2.5 w-full">
            <div class="flex flex-col gap-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-md p-10"></div>
          </Tabs.Content>
          <Tabs.Content value="overview" class="flex flex-col gap-2.5 w-full">
            <div class="flex flex-col gap-2.5">
              <div class="flex flex-col gap-2.5">
                <For each={Object.entries(project())}>
                  {([key, value]) => (
                    <div class="flex flex-row items-center justify-between">
                      <span>{key}</span>
                      <span>
                        {key !== "protected" ? value.toString() : Array(value.toString().length).fill("*").join("")}
                      </span>
                    </div>
                  )}
                </For>
              </div>
              <div class="w-full flex ">
                <button
                  class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black w-full"
                  onClick={async () => {
                    const p = project();
                    await createProject.mutateAsync(p);
                    setModalOpen(false);
                  }}
                >
                  <span class="font-bold select-none">Create</span>
                </button>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
        <div class="flex flex-row items-center justify-between gap-2.5">
          <div class="flex flex-row gap-2.5">
            <button
              class="p-2 py-1 flex items-center justify-center bg-white dark:bg-black gap-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md active:bg-neutral-100 dark:active:bg-neutral-800 text-black dark:text-white"
              onClick={() => {
                setProject({
                  name: "",
                  description: "",
                  protected: "",
                  visibility: "private",
                  org: Object.keys(organizations.data ?? {})[0] ?? "",
                });
                setModalOpen(false);
              }}
            >
              <span class="font-bold select-none">Cancel</span>
            </button>
          </div>
          <div class="flex flex-row gap-2.5">
            <button
              class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black disabled:bg-neutral-100 disabled:dark:bg-neutral-800 disabled:text-neutral-500 disabled:dark:text-neutral-400"
              disabled={currentTab() === "project"}
              onClick={() => {
                const potentialTab = tabSteps.backward[currentTab()];
                if (!potentialTab) return;
                setCurrentTab(potentialTab);
              }}
            >
              <span class="font-bold select-none">Previous</span>
            </button>
            <button
              // next step
              class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black disabled:bg-neutral-100 disabled:dark:bg-neutral-800 disabled:text-neutral-500 disabled:dark:text-neutral-400"
              onClick={() => {
                const potentialTab = tabSteps.forward[currentTab()];
                if (!potentialTab) return;
                setCurrentTab(potentialTab);
              }}
              disabled={currentTab() === "overview"}
            >
              <span class="font-bold select-none">Next</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
