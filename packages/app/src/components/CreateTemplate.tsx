import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { Modal } from "./Modal";
import { Select, Tabs, TextField, Switch as KSwitch, Checkbox, RadioGroup } from "@kobalte/core";
import { Mutations } from "../utils/api/mutations";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { useAuth } from "./Auth";
import { cn } from "../utils/cn";
import { Queries, technologies } from "../utils/api/queries";
import { A } from "@solidjs/router";

const DefaultTemplate: Parameters<typeof Mutations.createTemplate>[1] = {
  name: "",
  s3Key: "",
  hidden: false,
  description: "",
  protected: "",
};

type CreateTemplateProps = {
  templates: Awaited<ReturnType<typeof Queries.userTemplates>>;
};

export const CreateTemplate = (props: CreateTemplateProps) => {
  const [user] = useAuth();

  type TabStep = "template" | "files" | "overview";
  type FilesFrom = "url" | "zip" | "custom";
  const [setupFrom, setSetupFrom] = createSignal<FilesFrom>("url");

  const [currentTab, setCurrentTab] = createSignal<TabStep>("template");
  const tabSteps: {
    forward: Record<TabStep, TabStep | null>;
    backward: Record<TabStep, TabStep | null>;
  } = {
    forward: {
      template: "files",
      files: "overview",
      overview: null,
    },
    backward: {
      template: null,
      files: "template",
      overview: "files",
    },
  };

  const [template, setTemplate] = createSignal<Parameters<typeof Mutations.createTemplate>[1]>(DefaultTemplate);

  const createTemplate = createMutation((template: Parameters<typeof Mutations.createTemplate>[1]) => {
    const u = user();
    if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");

    return Mutations.createTemplate(token, template);
  });

  const isAvailableTemplateName = (name: string) => {
    return props.templates.every((t) => t.name !== name);
  };

  const technologies = createQuery(
    () => ["technologies"],
    () => {
      const u = user();
      if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.technologies(token);
    },
    {
      get enabled() {
        const u = user();
        return u.isAuthenticated && !!u.token;
      },
      refetchOnWindowFocus: false,
      refetchInterval: 10_000,
    }
  );

  const [technologiesCollection, setTechnologiesCollection] = createSignal<
    Awaited<ReturnType<typeof Queries.technologies>>
  >([]);

  return (
    <div class="w-full flex flex-col gap-2.5">
      <Tabs.Root
        value={currentTab()}
        onChange={(v) => {
          setCurrentTab(v as TabStep);
        }}
        class="w-full flex flex-col gap-3 py-4"
      >
        <Tabs.List class="flex flex-row w-full pt-2">
          <Tabs.Trigger
            value={"template" as TabStep}
            class="border-neutral-100 dark:border-neutral-900 border-b-2 dark:ui-selected:border-b-white ui-selected:border-b-black py-1 px-2 font-medium ui-selected:font-bold"
          >
            Template
          </Tabs.Trigger>
          <Tabs.Trigger
            value={"files" as TabStep}
            class="border-neutral-100 dark:border-neutral-900 border-b-2 dark:ui-selected:border-b-white ui-selected:border-b-black py-1 px-2 font-medium ui-selected:font-bold"
          >
            Files
          </Tabs.Trigger>
          <Tabs.Trigger
            value={"overview" as TabStep}
            class=" border-neutral-100 dark:border-neutral-900 border-b-2 dark:ui-selected:border-b-white ui-selected:border-b-black py-1 px-2 font-medium ui-selected:font-bold"
          >
            Overview
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="template" class="flex flex-col gap-2.5 w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            class="flex flex-col gap-2.5 w-full"
          >
            <TextField.Root
              required
              class="w-full flex flex-col gap-0.5"
              value={template().name}
              name="template-name"
              onChange={(name) => {
                setTemplate({ ...template(), name });
              }}
            >
              <TextField.Label class="text-sm font-medium">Name</TextField.Label>
              <TextField.Input
                placeholder="What should the template be called?"
                class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
              />
              <Show when={template().name.length > 0}>
                <TextField.Description
                  class={cn("text-sm text-neutral-500 dark:text-neutral-400", {
                    "!text-red-500": !isAvailableTemplateName(template().name),
                  })}
                >
                  {!isAvailableTemplateName(template().name)
                    ? "This name is already taken."
                    : "This name is available."}
                </TextField.Description>
              </Show>
            </TextField.Root>
            <TextField.Root
              class="w-full flex flex-col gap-0.5"
              value={template().description}
              onChange={(description) => {
                setTemplate({ ...template(), description });
              }}
              name="template-description"
            >
              <TextField.Label class="text-sm font-medium">Description</TextField.Label>
              <TextField.TextArea
                placeholder="What should the template be known for?"
                class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
              />
            </TextField.Root>
            <Checkbox.Root
              class="w-full flex flex-col gap-0.5 !border-none"
              checked={template().hidden}
              onChange={(hidden) => {
                setTemplate({ ...template(), hidden });
              }}
              name="template-hidden"
            >
              <Checkbox.Label class="text-sm font-medium">Hidden</Checkbox.Label>
              <Checkbox.Control class="w-6 h-6 border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 rounded-md cursor-pointer flex items-center justify-center">
                <Show when={template().hidden}>
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
                </Show>
              </Checkbox.Control>
              <Checkbox.Description class="text-sm text-neutral-500 dark:text-neutral-400">
                Hide this template from the public.
              </Checkbox.Description>
            </Checkbox.Root>
            <TextField.Root
              class="w-full flex flex-col gap-0.5"
              value={template().protected}
              name="template-protected"
              onChange={(prot) => {
                setTemplate({ ...template(), protected: prot });
              }}
            >
              <TextField.Label class="text-sm font-medium">Protected (password)</TextField.Label>
              <TextField.Input
                type="password"
                placeholder=""
                class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
              />
            </TextField.Root>
          </form>
        </Tabs.Content>
        <Tabs.Content value="files" class="flex flex-col gap-4 w-full">
          <RadioGroup.Root
            defaultValue={"url" as FilesFrom}
            value={setupFrom()}
            onChange={(x) => {
              if (!x) return;
              setSetupFrom(x as FilesFrom);
            }}
            class="flex flex-col gap-2.5 w-full"
          >
            <RadioGroup.Label>Upload from</RadioGroup.Label>
            <div class="grid grid-cols-3 gap-2">
              <For
                each={
                  [
                    {
                      value: "url",
                      label: "URL",
                    },
                    {
                      value: "zip",
                      label: "ZIP File",
                    },
                    {
                      value: "custom",
                      label: "Custom",
                    },
                  ] as { value: FilesFrom; label: string }[]
                }
              >
                {(item) => (
                  <RadioGroup.Item value={item.value}>
                    <RadioGroup.ItemControl
                      class={cn(
                        "cursor-pointer border border-transparent bg-neutral-100 dark:bg-neutral-900 rounded-md p-4 font-bold",
                        {
                          "!dark:bg-teal-900 !bg-teal-500 border dark:border-white text-white":
                            setupFrom() === item.value,
                        }
                      )}
                    >
                      {item.label}
                    </RadioGroup.ItemControl>
                  </RadioGroup.Item>
                )}
              </For>
            </div>
          </RadioGroup.Root>
          <Show when={setupFrom() === "url"}>
            <TextField.Root class="w-full flex flex-col gap-0.5">
              <TextField.Label class="text-sm font-medium">URL</TextField.Label>
              <TextField.Input
                placeholder="https://example.com/file.zip"
                class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
              />
            </TextField.Root>
          </Show>
          <Show when={setupFrom() === "custom"}>
            {/* 
              Here I need to make an UI that helps the user generate a custom setup.
              Meaning, they can select the stack.
              Stacks are defined in the backend.
              These include: Database(Turso, RDS(?), etc.), Frontend(Solid-Start), Backend(Lambdas, Docker, etc.), CI/CD(Github Actions, CircleCI, etc.)
              */}
            <div class="grid grid-cols-3">
              <Switch
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
                    class="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                }
              >
                <Match when={technologies.isSuccess && technologies.data}>
                  {(theTechnologies) => (
                    <For each={theTechnologies()}>
                      {(tech) => (
                        <div
                          class={cn(
                            "p-10 w-full flex flex-col gap-2 rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 select-none bg-tranparent border border-neutral-200 dark:border-neutral-800",
                            {
                              "bg-neutral-100 dark:bg-neutral-900":
                                technologiesCollection().findIndex((s) => s.id === tech.id) !== -1,
                            }
                          )}
                          onClick={() => {
                            // add/remove from the `stackCollection`
                            const copyStackCollection: Awaited<ReturnType<typeof Queries.technologies>> = Object.create(
                              technologiesCollection()
                            );
                            const index = copyStackCollection.findIndex((s) => s.id === tech.id);
                            if (index === -1) {
                              setTechnologiesCollection([...copyStackCollection, tech]);
                            } else {
                              copyStackCollection.splice(index, 1);
                              setTechnologiesCollection(() => copyStackCollection);
                            }
                          }}
                        >
                          <div class="flex flex-col gap-0.5">
                            <span class="text-xs">{tech.id}</span>
                            <span class="font-bold">{tech.name}</span>
                          </div>
                          <span class="font-medium">{tech.description}</span>
                          <span class="text-xs">{tech.stacks.map((x) => x.stack.name).join(",")}</span>
                        </div>
                      )}
                    </For>
                  )}
                </Match>
                <Match when={technologies.isError}>
                  <div class="p-10 w-full flex flex-col gap-2 rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 select-none bg-tranparent border border-neutral-200 dark:border-neutral-800">
                    <span class="font-bold">Error</span>
                    <span class="font-medium">{JSON.stringify(technologies.error)}</span>
                  </div>
                </Match>
              </Switch>
            </div>
          </Show>
          <Show when={setupFrom() === "zip"}>
            <div class="flex flex-col gap-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-md  items-center justify-center">
              <label
                for="dropzone-file"
                class="flex flex-col items-center justify-center w-full h-64 rounded-md cursor-pointer bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:border-neutral-800 dark:hover:border-neutral-500 dark:hover:bg-neutral-800 p-10"
              >
                <div class="flex flex-col items-center justify-center ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m16 16-4-4-4 4" />
                  </svg>
                  <p class="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <span class="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    <span class="font-semibold">.zip</span> files only
                  </p>
                </div>
                <input id="dropzone-file" type="file" accept=".zip" class="hidden" />
              </label>
            </div>
          </Show>
        </Tabs.Content>
        <Tabs.Content value="overview" class="flex flex-col gap-2.5 w-full">
          <div class="flex flex-col gap-2.5">
            <div class="flex flex-col gap-2.5">
              <For each={Object.entries(template())}>
                {([key, value]) => (
                  <div class="flex flex-row items-center justify-between">
                    <span>{key}</span>
                    <span>
                      {key !== "protected" ? value.toString() : Array(value.toString().length).fill("*").join("")}
                    </span>
                  </div>
                )}
              </For>
              <div class="flex flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
                <span>Stack</span>
                <span>Unknown</span>
              </div>
              <div class="flex flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
                <span>CI/CD</span>
                <span>Unknown</span>
              </div>
            </div>
            <div class="w-full flex ">
              <button
                class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black w-full"
                onClick={async () => {
                  const p = template();
                  await createTemplate.mutateAsync(p);
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
          <A
            class="p-2 py-1 flex items-center justify-center bg-white dark:bg-black gap-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md active:bg-neutral-100 dark:active:bg-neutral-800 text-black dark:text-white"
            href="/dashboard/templates"
          >
            <span class="font-bold select-none">Cancel</span>
          </A>
        </div>
        <div class="flex flex-row gap-2.5">
          <button
            class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black disabled:bg-neutral-100 disabled:dark:bg-neutral-800 disabled:text-neutral-500 disabled:dark:text-neutral-400"
            disabled={currentTab() === "template"}
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
  );
};
