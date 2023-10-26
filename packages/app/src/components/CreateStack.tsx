import { Checkbox, RadioGroup, TextField } from "@kobalte/core";
import { Technology } from "@oetzidev/core/entities/technologies";
import { debounce } from "@solid-primitives/scheduled";
import { A } from "@solidjs/router";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, JSX, Match, Show, Switch, createSignal } from "solid-js";
import { z } from "zod";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";
import { useAuth } from "./providers/OfflineFirst";
import Highlight from "./CodePreview";
import "highlight.js/styles/obsidian.min.css";

const DefaultTemplate: Parameters<typeof Mutations.Stacks.create>[1] = {
  name: "",
  version: "",
  s3Key: "",
  hidden: false,
  description: "",
  protected: "",
};

type TabStep = "stack" | "files" | "overview";

type Setup = {
  type: "url" | "toml" | "custom";
  url?: string;
  file?: File | null;
  custom?: any;
  checked: boolean;
  preview: Array<Technology.Frontend> | null;
};

const StackUploadOptions = [
  {
    value: "toml",
    label: "TOML File",
    icon: (
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
        <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 18 3-3-3-3" />
        <path d="m5 12-3 3 3 3" />
      </svg>
    ),
  },
  {
    value: "url",
    label: "URL",
    icon: (
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
        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
        <line x1="8" x2="16" y1="12" y2="12" />
      </svg>
    ),
  },
  {
    value: "custom",
    label: "Custom",
    icon: (
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
        class="lucide lucide-layers"
      >
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
      </svg>
    ),
  },
] as { value: Setup["type"]; label: string; icon: JSX.Element }[];

type CreateStackProps = {
  stacks: Awaited<ReturnType<typeof Queries.userStacks>>;
};

export const CreateStack = (props: CreateStackProps) => {
  const [user] = useAuth();
  const queryClient = useQueryClient();

  const [setupFrom, setSetupFrom] = createSignal<Setup>({
    type: "toml",
    url: "",
    custom: null,
    file: null,
    checked: false,
    preview: null,
  });

  const [stack, setStack] = createSignal<Parameters<typeof Mutations.Stacks.create>[1]>(DefaultTemplate);

  const setName = debounce(setStack, 500);

  const createTemplate = createMutation((template: Parameters<typeof Mutations.Stacks.create>[1]) => {
    const u = user();
    if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");

    return Mutations.Stacks.create(token, template);
  });

  const stackVersion = createQuery(
    () => ["stackVersion"],
    () => {
      const u = user();
      if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      const name = stack().name;
      if (!name) return Promise.reject("No stack name provided.");
      return Queries.calculateStackVersion(token, name);
    },
    {
      get enabled() {
        const u = user();
        const name = stack().name;
        return u.isAuthenticated && u.token !== null && name.length > 0;
      },
      refetchOnWindowFocus: false,
    }
  );

  const isAvailableTemplateName = (name: string) => {
    return props.stacks.every(({ stack }) => stack.name !== name);
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

  const checkStackFromUrl = createMutation((url: string) => {
    const u = user();
    if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");

    return Mutations.Stacks.checkFromUrl(token, url);
  });

  const checkStackFromFile = createMutation((file: string) => {
    const u = user();
    if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");

    return Mutations.Stacks.checkFromFile(token, file);
  });

  return (
    <div class="w-full flex flex-col gap-2.5 py-10">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        class="flex flex-col gap-4 w-full"
      >
        <div class="flex flex-col gap-2.5 w-full pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div class="flex flex-row justify-between items-center gap-2.5">
            <div>
              <h1 class="font-bold text-3xl">Create New Stack</h1>
            </div>
            <div class="flex gap-2.5 items-center justify-center">
              <Checkbox.Root
                class="w-max"
                checked={stack().hidden}
                onChange={(hidden) => {
                  setStack({ ...stack(), hidden });
                }}
                name="template-hidden"
              >
                <Checkbox.Control
                  class={cn(
                    "flex flex-row gap-2 border border-neutral-200 bg-teal-100 dark:border-teal-700 dark:bg-teal-900 rounded-md cursor-pointer items-center justify-center w-max p-1 px-2",
                    {
                      "border-orange-500 text-orange-500 bg-orange-50 dark:bg-orange-950 dark:border-orange-900":
                        stack().hidden,
                    }
                  )}
                >
                  <div>
                    This project will be{" "}
                    <Switch>
                      <Match when={stack().hidden}>
                        <span class="font-bold">Private</span>
                      </Match>
                      <Match when={!stack().hidden}>
                        <span class="font-bold">Public</span>
                      </Match>
                    </Switch>
                  </div>
                </Checkbox.Control>
              </Checkbox.Root>
              <span class="text-neutral-500">{stackVersion.data ?? "No Version"}</span>
            </div>
          </div>
          <TextField.Root required class="w-full flex flex-col gap-0.5" name="template-name">
            <TextField.Label class="text-sm font-medium">Name</TextField.Label>
            <TextField.Input
              placeholder="What should the stack be called?"
              class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
              value={stack().name}
              onInput={(e) => {
                setName({ ...stack(), name: e.currentTarget.value });
              }}
            />
            <Show when={stack().name.length > 0}>
              <TextField.Description
                class={cn("text-sm text-neutral-500 dark:text-neutral-400", {
                  "!text-red-500": !isAvailableTemplateName(stack().name),
                })}
              >
                {!isAvailableTemplateName(stack().name) ? "This name is already taken." : "This name is available."}
              </TextField.Description>
            </Show>
          </TextField.Root>
          <TextField.Root
            class="w-full flex flex-col gap-0.5"
            value={stack().description}
            onChange={(description) => {
              setStack({ ...stack(), description });
            }}
            name="template-description"
          >
            <TextField.Label class="text-sm font-medium">Description</TextField.Label>
            <TextField.TextArea
              placeholder="What should the template be known for?"
              class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800 min-h-[50px]"
            />
          </TextField.Root>
          <TextField.Root
            class="w-full flex flex-col gap-0.5"
            value={stack().protected}
            name="template-protected"
            onChange={(prot) => {
              setStack({ ...stack(), protected: prot });
            }}
          >
            <TextField.Label class="text-sm font-medium">Protected (password)</TextField.Label>
            <TextField.Input
              type="password"
              placeholder=""
              class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
            />
          </TextField.Root>
        </div>
        <div class="flex flex-col gap-2.5 w-full pb-8 ">
          <RadioGroup.Root
            defaultValue="toml"
            value={setupFrom().type}
            onChange={(x) => {
              if (!x) return;
              if (x === "url") {
                setSetupFrom({ type: "url", url: "", checked: false, preview: null });
                checkStackFromUrl.reset();
              }
              if (x === "toml") {
                setSetupFrom({ type: "toml", file: null, checked: false, preview: null });
                checkStackFromFile.reset();
              }
              if (x === "custom") {
                setSetupFrom({ type: "custom", checked: false, preview: null });
              }
            }}
            class="flex flex-col gap-2.5 w-full"
          >
            <RadioGroup.Label>Upload from</RadioGroup.Label>
            <div class="grid grid-cols-3 gap-2">
              <For each={StackUploadOptions}>
                {(item) => (
                  <RadioGroup.Item value={item.value}>
                    <RadioGroup.ItemControl
                      class={cn(
                        "cursor-pointer border border-neutral-300 dark:border-neutral-800 bg-transparent rounded-md p-4 font-bold flex flex-col gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 select-none",
                        {
                          "!border-teal-500 !text-teal-500": setupFrom().type === item.value,
                        }
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </RadioGroup.ItemControl>
                  </RadioGroup.Item>
                )}
              </For>
            </div>
          </RadioGroup.Root>
          <div class="flex flex-col gap-2.5 w-full">
            <Switch>
              <Match when={setupFrom().type === "url" && setupFrom()}>
                {(suf) => (
                  <div class="flex flex-col gap-4">
                    <TextField.Root
                      class="w-full flex flex-col gap-0.5"
                      value={suf().url}
                      onChange={(url) => setSetupFrom({ ...setupFrom(), url })}
                    >
                      <TextField.Label class="text-sm font-medium">URL</TextField.Label>
                      <TextField.Input
                        placeholder="https://example.com/file.toml"
                        class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
                      />
                    </TextField.Root>
                    <div class="flex flex-row items-center justify-between">
                      <div class="flex flex-row gap-2.5">
                        <Switch>
                          <Match when={checkStackFromUrl.isIdle}>
                            <button
                              type="button"
                              class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black w-full disabled:bg-neutral-100 disabled:dark:bg-neutral-800 disabled:text-neutral-500 disabled:dark:text-neutral-400 disabled:cursor-not-allowed"
                              disabled={
                                (setupFrom().url ?? "").length === 0 ||
                                !z.string().url().safeParse(setupFrom().url).success
                              }
                              onClick={async () => {
                                const url = setupFrom().url;
                                if (!url) return;
                                await checkStackFromUrl.mutateAsync(url);
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
                                <path d="M14.5 22H18a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                                <polyline points="14 2 14 8 20 8" />
                                <path d="M2.97 13.12c-.6.36-.97 1.02-.97 1.74v3.28c0 .72.37 1.38.97 1.74l3 1.83c.63.39 1.43.39 2.06 0l3-1.83c.6-.36.97-1.02.97-1.74v-3.28c0-.72-.37-1.38-.97-1.74l-3-1.83a1.97 1.97 0 0 0-2.06 0l-3 1.83Z" />
                                <path d="m7 17-4.74-2.85" />
                                <path d="m7 17 4.74-2.85" />
                                <path d="M7 17v5" />
                              </svg>
                              <span>Check File</span>
                            </button>
                          </Match>
                          <Match when={checkStackFromUrl.isLoading}>
                            <div class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black w-full">
                              <span class="font-bold select-none">Checking</span>
                              <span class="font-medium">Checking file...</span>
                            </div>
                          </Match>
                          <Match when={checkStackFromUrl.isError}>
                            <div class="p-2 py-1 flex items-center justify-center bg-red-500 gap-2.5 hover:bg-red-600 rounded-md active:bg-red-700 text-white w-full">
                              <span class="font-bold select-none">Error</span>
                              <span class="font-medium">
                                {checkStackFromUrl.error instanceof Error
                                  ? checkStackFromUrl.error.message
                                  : "Unknown error"}
                              </span>
                            </div>
                          </Match>
                          <Match when={checkStackFromUrl.isSuccess}>
                            <div class="p-2 py-1 flex items-center justify-center bg-green-500 gap-2.5 hover:bg-green-600 rounded-md active:bg-green-700 text-white w-full">
                              <span class="font-bold select-none">Success</span>
                              <span class="font-medium">File is valid.</span>
                            </div>
                          </Match>
                        </Switch>
                      </div>
                      <div></div>
                    </div>
                  </div>
                )}
              </Match>
              <Match when={setupFrom().type === "toml"}>
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-md items-center justify-center">
                    <Switch
                      fallback={
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
                              <span class="font-semibold">.toml</span> files only
                            </p>
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            accept=".toml"
                            class="hidden"
                            onInput={(e) => {
                              const files = e.target.files;
                              if (!files) return;
                              const file = files[0];
                              if (!file) return;
                              checkStackFromFile.reset();
                              setSetupFrom({ ...setupFrom(), file });
                              const reader = new FileReader();
                              reader.onload = async (e) => {
                                const text = e.target?.result;
                                if (!text) return;
                                const technologies = await checkStackFromFile.mutateAsync(text.toString());
                                if (!technologies) return;
                                if ("error" in technologies) return;
                                setSetupFrom({ ...setupFrom(), preview: technologies });
                              };
                              reader.readAsText(file);
                            }}
                          />
                        </label>
                      }
                    >
                      <Match
                        when={
                          checkStackFromFile.isSuccess && (setupFrom().preview ?? []).length > 0 && setupFrom().preview
                        }
                      >
                        {(techs) => (
                          <div class="flex flex-col gap-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-md items-center justify-center p-4 w-full">
                            <For each={techs()}>
                              {(tech) => (
                                <div class="flex flex-col p-4 w-full height-auto bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800 gap-2">
                                  <span class="text-teal-500">
                                    {tech.name} ({tech.version})
                                  </span>
                                  <Highlight class="!bg-transparent !p-0" autoDetect={false} language="typescript">
                                    {tech.template}
                                  </Highlight>
                                </div>
                              )}
                            </For>
                          </div>
                        )}
                      </Match>
                      <Match when={checkStackFromFile.isLoading}>
                        <div class="flex w-full flex-col gap-2.5 items-center justify-center p-4">
                          <div class="p-10 flex w-full bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                          <div class="p-10 flex w-full bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                          <div class="p-10 flex w-full bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                          <div class="p-10 flex w-full bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                        </div>
                      </Match>
                    </Switch>
                  </div>
                  <div class="flex flex-row items-center justify-between">
                    <div class="flex flex-row gap-2.5">
                      <Switch>
                        <Match when={checkStackFromFile.isIdle}>
                          <div class="p-2 py-1 flex items-center justify-center gap-2.5 rounded-md w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed">
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
                              <path d="M14.5 22H18a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                              <polyline points="14 2 14 8 20 8" />
                              <path d="M2.97 13.12c-.6.36-.97 1.02-.97 1.74v3.28c0 .72.37 1.38.97 1.74l3 1.83c.63.39 1.43.39 2.06 0l3-1.83c.6-.36.97-1.02.97-1.74v-3.28c0-.72-.37-1.38-.97-1.74l-3-1.83a1.97 1.97 0 0 0-2.06 0l-3 1.83Z" />
                              <path d="m7 17-4.74-2.85" />
                              <path d="m7 17 4.74-2.85" />
                              <path d="M7 17v5" />
                            </svg>
                            <span>First, upload a file</span>
                          </div>
                        </Match>
                        <Match when={checkStackFromFile.isLoading}>
                          <div class="p-2 py-1 flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 rounded-md gap-2.5">
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
                            <span class="font-medium">Checking file...</span>
                          </div>
                        </Match>
                        <Match when={checkStackFromFile.isSuccess}>
                          <Switch>
                            <Match when={"error" in checkStackFromFile.data!}>
                              <div class="p-2 py-1 flex items-center justify-center bg-red-500 gap-2.5 hover:bg-red-600 rounded-md active:bg-red-700 text-white w-full">
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
                                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                                  <path d="M14 2v6h6" />
                                  <path d="m3 12.5 5 5" />
                                  <path d="m8 12.5-5 5" />
                                </svg>
                                <span class="font-medium">
                                  {
                                    // @ts-ignore
                                    checkStackFromFile.data!.error
                                  }
                                </span>
                              </div>
                            </Match>
                            <Match when={!("error" in checkStackFromFile.data!)}>
                              <div class="p-2 py-1 flex items-center justify-center bg-green-500 gap-2.5 hover:bg-green-600 rounded-md active:bg-green-700 text-white w-full">
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
                                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <path d="m3 15 2 2 4-4" />
                                </svg>
                                <span class="font-medium">File is valid</span>
                              </div>
                            </Match>
                          </Switch>
                        </Match>
                      </Switch>
                    </div>
                    <div>
                      <button
                        type="button"
                        class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black w-full"
                        onClick={() => {
                          setSetupFrom({ type: "toml", file: null, checked: false, preview: null });
                          checkStackFromFile.reset();
                        }}
                      >
                        <div></div>
                        <span class="font-medium">Reset</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Match>
              <Match when={setupFrom().type === "custom"}>
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
                                const copyStackCollection: Awaited<ReturnType<typeof Queries.technologies>> =
                                  Object.create(technologiesCollection());
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
              </Match>
            </Switch>
          </div>
        </div>
      </form>
      <div class="flex flex-row items-center justify-between gap-2.5">
        <div class="flex flex-row gap-2.5"></div>
        <div class="flex flex-row gap-2.5">
          <A
            class="p-2 py-1 flex items-center justify-center bg-white dark:bg-black gap-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md active:bg-neutral-100 dark:active:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-800"
            href="/dashboard/stacks"
          >
            <span class="font-bold select-none">Cancel</span>
          </A>
          <button
            type="button"
            class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black"
          >
            <span class="font-bold select-none">Create</span>
          </button>
        </div>
      </div>
    </div>
  );
};
