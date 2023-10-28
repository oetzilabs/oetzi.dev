import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Queries } from "../../../utils/api/queries";
import { useAuth } from "../../../components/providers/OfflineFirst";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { Modal } from "../../../components/Modal";
import { Mutations } from "../../../utils/api/mutations";
import { A } from "@solidjs/router";

const CreateLink = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [user] = useAuth();
  const queryClient = useQueryClient();
  const [link, setLink] = createSignal<{
    group: string;
    type: string;
    active: boolean;
    protected: string;
    url: string;
  }>({
    group: "",
    type: "",
    active: true,
    protected: "", // length 0 means no password
    url: "",
  });

  const createLink = createMutation(
    () => {
      const u = user();
      if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      const l = link();

      return Mutations.Links.create(token, l);
    },
    {
      async onSuccess(data, variables, context) {
        await queryClient.invalidateQueries(["links"]);
        setIsOpen(false);
        setLink({
          group: "",
          type: "",
          active: true,
          protected: "", // length 0 means no password
          url: "",
        });
      },
    }
  );

  return (
    <Modal
      title="Create a new link"
      onOpenChange={setIsOpen}
      open={isOpen()}
      trigger={
        <button
          class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black"
          onClick={() => {
            setLink({
              group: "",
              type: "",
              active: true,
              protected: "", // length 0 means no password
              url: "",
            });
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
          <span class="font-bold select-none">Create Link</span>
        </button>
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
              setLink({
                ...link(),
                url: e.currentTarget.value,
              });
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
              setLink({
                ...link(),
                group: e.currentTarget.value,
              });
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
              setLink({
                ...link(),
                type: e.currentTarget.value,
              });
            }}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2.5">
        <button
          class="w-full bg-black dark:bg-white hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black p-2.5 font-bold"
          disabled={createLink.isLoading}
          onClick={async () => {
            await createLink.mutateAsync();
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

export default function LinksPage() {
  const [user] = useAuth();
  const links = createQuery(
    () => ["links"],
    () => {
      const u = user();
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");

      return Queries.links(token);
    },
    {
      get enabled() {
        const u = user();

        return !u.isLoading && u.isAuthenticated;
      },
      refetchInterval: 0,
      refetchOnWindowFocus: false,
    }
  );
  const removeLink = createMutation((id: string) => {
    const u = user();
    if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");

    return Mutations.Links.remove(token, id);
  });
  return (
    <div class="container mx-auto flex flex-col gap-4 py-10">
      <div class="flex flex-row items-center justify-between w-full">
        <h1 class="text-3xl font-bold">Links</h1>
        <div>
          <CreateLink />
        </div>
      </div>
      <div class="w-full flex flex-col gap-4">
        <Switch>
          <Match when={links.isLoading}>
            <div class="w-full flex flex-row items-center justify-center">
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
          <Match when={links.error}>
            <div class="w-full flex flex-row items-center justify-center">
              <div class="text-red-500 dark:text-red-400">
                There was an error fetching your links. Please try again later.
              </div>
            </div>
          </Match>
          <Match when={links.isSuccess && links.data}>
            {(links) => (
              <For
                each={links()}
                fallback={
                  <div class="w-full flex flex-col gap-4 items-center justify-center">
                    <div>There are currently no links</div>
                    <CreateLink />
                  </div>
                }
              >
                {(link) => (
                  <div
                    class="relative w-full flex flex-col gap-2.5 border border-neutral-200 dark:border-neutral-800 rounded-md p-2.5 bg-neutral-50 dark:bg-neutral-950 before:bg-black/5 before:contents before:absolute before:inset-0 before:rounded-md before:z-[-1]"
                    style={{
                      // add the twitter:image as a background image
                      ["background-image"]: `url(${link.meta.find((x) => x.name === "twitter:image")?.content || ""})`,
                      ["background-size"]: "cover",
                      ["background-position"]: "center",
                    }}
                  >
                    <div class="flex flex-row gap-2">
                      <div class="font-bold">{link.group}</div>
                      <div class="font-medium">{link.type}</div>
                    </div>
                    <div class="flex flex-row items-center gap-2.5">
                      <div class="">{link.active ? "Active" : "Disabled"}</div>
                      <div class="">
                        <button
                          class=""
                          onClick={async () => {
                            await removeLink.mutateAsync(link.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <A
                      href={`${import.meta.env.VITE_API_URL}/link/${link.group}?type=${link.type}`}
                      rel="external"
                      target="_blank"
                      class="bg-black dark:bg-white rounded-md p-2.5 text-white dark:text-black font-bold flex flex-row gap-2.5 w-max items-center text-sm"
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
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" x2="21" y1="14" y2="3" />
                      </svg>
                      {link.url}
                    </A>
                  </div>
                )}
              </For>
            )}
          </Match>
        </Switch>
      </div>
    </div>
  );
}
