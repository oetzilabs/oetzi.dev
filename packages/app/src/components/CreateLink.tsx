import { useQueryClient, createMutation } from "@tanstack/solid-query";
import { createSignal, Switch, Match, Show } from "solid-js";
import { Mutations } from "../utils/api/mutations";
import { Modal } from "./Modal";
import { useAuth } from "./providers/OfflineFirst";

export const CreateLink = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [user] = useAuth();
  const queryClient = useQueryClient();
  const [link, setLink] = createSignal<Parameters<typeof Mutations.Links.create>[1]>({
    group: "",
    type: "",
    protected: "", // length 0 means no password
    url: "",
  });

  const createLink = createMutation((link: Parameters<typeof Mutations.Links.create>[1]) => {
    const u = user();
    if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");

    return Mutations.Links.create(token, link);
  });

  return (
    <Modal
      open={isOpen()}
      onOpenChange={setIsOpen}
      title="Create a new Link"
      description="Create a new link to open via shortener."
      trigger={
        <div class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black">
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
          <span class="font-bold select-none">Create Link</span>
        </div>
      }
    >
      <div class="w-full flex flex-col gap-4">
        <div class="w-full flex flex-col gap-2.5">
          <label class="font-medium">URL</label>
          <input
            type="text"
            class="w-full border border-black/[0.05] dark:border-white/[0.05] rounded-md p-2.5 bg-black/[0.01] dark:bg-white/[0.01]"
            value={link().url}
            onInput={(e) => {
              setLink((l) => ({
                ...l,
                url: e.currentTarget.value,
              }));
            }}
          />
        </div>
        <div class="w-full flex flex-col gap-2.5">
          <label class="font-medium">Group</label>
          <input
            type="text"
            class="w-full border border-black/[0.05] dark:border-white/[0.05] rounded-md p-2.5 bg-black/[0.01] dark:bg-white/[0.01]"
            value={link().group}
            onInput={(e) => {
              setLink((l) => ({
                ...l,
                group: e.currentTarget.value,
              }));
            }}
          />
        </div>
        <div class="w-full flex flex-col gap-2.5">
          <label class="font-medium">Type</label>
          <input
            type="text"
            class="w-full border border-black/[0.05] dark:border-white/[0.05] rounded-md p-2.5 bg-black/[0.01] dark:bg-white/[0.01]"
            value={link().type}
            onInput={(e) => {
              setLink((l) => ({
                ...l,
                type: e.currentTarget.value,
              }));
            }}
          />
        </div>
        <div class="w-full flex flex-col gap-2.5">
          <label class="font-medium">Protect (empty means unprotected)</label>
          <input
            type="password"
            class="w-full border border-black/[0.05] dark:border-white/[0.05] rounded-md p-2.5 bg-black/[0.01] dark:bg-white/[0.01]"
            value={link().protected}
            onInput={(e) => {
              setLink((l) => ({
                ...l,
                protected: e.currentTarget.value,
              }));
            }}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2.5">
        <button
          class="w-full bg-black dark:bg-white hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black p-2.5 font-bold"
          disabled={createLink.isLoading}
          onClick={async () => {
            const l = link();
            const x = await createLink.mutateAsync(l);
            await queryClient.invalidateQueries(["links"]);
            // setIsOpen(false);
            setLink(() => ({
              group: "",
              type: "",
              protected: "", // length 0 means no password
              url: "",
            }));
            setIsOpen(false);
          }}
        >
          <Switch>
            <Match when={createLink.isLoading}>Creating</Match>
            <Match when={createLink.isSuccess}>Created</Match>
            <Match when={createLink.isError}>Failed to Create</Match>
            <Match when={createLink.isIdle}>Create</Match>
          </Switch>
        </button>
        <Show when={createLink.isError}>
          {createLink.error instanceof Error ? createLink.error.message : "Unknown error"}
        </Show>
      </div>
    </Modal>
  );
};
