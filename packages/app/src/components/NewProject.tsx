import { createMutation, createQuery } from "@tanstack/solid-query";
import { Mutations } from "../utils/api/mutations";
import { Modal } from "./Modal";
import { useAuth } from "./Auth";
import { Match, Show, Switch, createSignal } from "solid-js";
import { Select, TextField } from "@kobalte/core";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";

export default function NewProject() {
  const [user] = useAuth();
  const createProject = createMutation(async (input: Parameters<typeof Mutations.createProject>[1]) => {
    let u = user();
    if (!u) return;
    if (!u.isAuthenticated) return;
    if (!u.token) return;

    return Mutations.createProject(u.token, input);
  });

  const [modalOpen, setModalOpen] = createSignal(false);
  const [project, setProject] = createSignal<Parameters<typeof Mutations.createProject>[1]>({
    name: "",
    description: "",
    protected: "", // length 0 means no password
    visibility: "private",
    organization: "",
  });

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
  const isAvailableRepositoryName = (name: string) =>
    organizations.data?.every((org) => org.repos.every((p) => p !== name)) ?? false;

  return (
    <Modal
      open={modalOpen()}
      onOpenChange={setModalOpen}
      title="Create a new project"
      trigger={
        <button class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black">
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
      <div class="w-full flex flex-col gap-2.5">
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
            <Match when={(organizations.data ?? []).length === 0}>
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
                value={project().organization}
                placeholder="Select an organization"
                onChange={(i) => {
                  setProject({ ...project(), organization: i });
                }}
                placement="bottom-start"
                required
                options={organizations.data?.map((org) => org.name) ?? []}
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
          onChange={(name) => {
            setProject({ ...project(), name });
          }}
        >
          <TextField.Label class="text-sm font-medium">Name</TextField.Label>
          <TextField.Input
            disabled={organizations.isLoading || project().organization.length === 0}
            placeholder="What should the repository be called?"
            class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
          />
          <Show when={project().name.length > 0}>
            <TextField.Description
              class={cn("text-sm text-neutral-500 dark:text-neutral-400", {
                "!text-red-500": !isAvailableRepositoryName(project().name),
              })}
            >
              {!isAvailableRepositoryName(project().name) ? "This name is already taken." : "This name is available."}
            </TextField.Description>
          </Show>
        </TextField.Root>
        <label class="text-sm font-medium">Visibility</label>
        <Select.Root
          defaultValue={"private" as Parameters<typeof Mutations.createProject>[1]["visibility"]}
          value={project().visibility}
          disabled={organizations.isLoading || project().organization.length === 0}
          placeholder="Select a visibility"
          onChange={(i) => {
            setProject({ ...project(), visibility: i });
          }}
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
        </Select.Root>
        <label class="text-sm font-medium">Description</label>
        <textarea
          disabled={organizations.isLoading || project().organization.length === 0}
          class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
        ></textarea>
        <div class="flex flex-row items-center justify-end gap-2.5">
          <button
            class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black"
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
    </Modal>
  );
}
