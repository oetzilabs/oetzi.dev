import { A, useNavigate } from "@solidjs/router";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { useAuth } from "../../../components/providers/OfflineFirst";
import { Mutations } from "../../../utils/api/mutations";
import { Queries } from "../../../utils/api/queries";
import { CreateLink } from "../../../components/CreateLink";
import { DropdownMenu } from "@kobalte/core";
import { Show } from "solid-js";
import toast from "solid-toast";
import { FakeProgressBar } from "../../../components/FakeProgressbar";

export default function LinksPage() {
  const [user] = useAuth();
  const queryClient = useQueryClient();
  const links = createQuery(
    () => ["links"],
    () => {
      const u = user();
      if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");

      return Queries.Links.all(token);
    },
    {
      get enabled() {
        const u = user();

        return !u.isLoading && u.isAuthenticated;
      },
      refetchInterval: 5_000,
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

  const toggleLinkActive = createMutation((props: { id: string; active: boolean }) => {
    const u = user();
    if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");

    return Mutations.Links.update(token, props);
  });

  const isDeleting = removeLink.isLoading;

  const navigator = useNavigate();

  const confirmRemoveLink = async (id: string) => {
    toast.custom(
      <div class="flex flex-col gap-2.5 relative p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md shadow-md overflow-clip">
        <div class="flex flex-col gap-1.5 text-neutral-900 dark:text-neutral-100">
          <h3 class="text-md font-bold">Are you sure?</h3>
          <p class="text-sm font-medium">This action is irreversible.</p>
        </div>
        <div class="flex flex-row items-center justify-end gap-2.5">
          <button
            class="bg-black dark:bg-white rounded-md text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 active:bg-black/90 dark:active:bg-white/90 px-2 py-1 font-bold"
            aria-label="Cancel"
            onClick={() => toast.dismiss()}
          >
            Cancel!
          </button>
          <button
            class="bg-red-50 dark:bg-red-950 rounded-md text-red-900 dark:text-red-50 hover:bg-red-50 dark:hover:bg-red-900 active:bg-red-50 dark:active:bg-red-800 px-2 py-1 font-bold"
            onClick={async () => {
              await removeLink.mutateAsync(id);
              if (queryClient) await queryClient.invalidateQueries(["links"]);
            }}
            aria-label="Delete Project"
          >
            Yes, delete!
          </button>
        </div>
        <FakeProgressBar time={5000} />
      </div>,
      {
        duration: 5000,
        position: "bottom-right",
      }
    );
  };

  return (
    <div class="container mx-auto flex flex-col gap-4 py-10">
      <div class="flex flex-row items-center justify-between w-full">
        <div>
          <h1 class="text-3xl font-bold">Links</h1>
        </div>
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
          <Match when={links.isError && links.error}>
            <div class="w-full flex flex-row items-center justify-center">
              <div class="text-red-500 dark:text-red-400">There was an error fetching your links.</div>
              <button
                onClick={async () => {
                  await links.refetch();
                }}
              >
                Refetch
              </button>
            </div>
          </Match>
          <Match when={links.isSuccess && links.data}>
            {(links) => (
              <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <div class="relative w-full flex flex-col gap-2.5 border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-50 dark:bg-neutral-950 overflow-clip">
                      <div class="flex flex-col h-full">
                        <img
                          src={link.meta.find((x) => x.name.includes("twitter:image"))?.content || ""}
                          class="aspect-square h-[240px] hidden xl:flex"
                        />
                        <div class="flex flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-900">
                          <div class="flex flex-col gap-2 p-2.5">
                            <div class="flex flex-row gap-2.5 items-center">
                              <Switch>
                                <Match when={toggleLinkActive.isLoading && toggleLinkActive.variables?.id === link.id}>
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
                                </Match>
                                <Match when={link.active}>
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
                                    class="text-teal-500 dark:text-teal-400"
                                  >
                                    <path d="M12 2v10" />
                                    <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                                  </svg>
                                </Match>
                                <Match when={!link.active}>
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
                                    class="text-red-500 dark:text-red-400"
                                  >
                                    <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
                                    <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
                                    <path d="M12 2v4" />
                                    <path d="m2 2 20 20" />
                                  </svg>
                                </Match>
                              </Switch>
                              <div class="font-bold">
                                {link.group}/{link.type}
                              </div>
                            </div>
                            <div class="font-semibold text-xs">{link.url}d</div>
                          </div>
                          <div class="p-2.5 flex flex-col items-start h-full">
                            <DropdownMenu.Root placement="right-start">
                              <DropdownMenu.Trigger class="flex flex-row gap-2.5 items-center justify-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 rounded-md cursor-pointer">
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
                                  class="lucide lucide-more-horizontal"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content class="z-50 ml-1 self-end w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                                  <DropdownMenu.Item
                                    class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]"
                                    onSelect={() => navigator(`/dashboard/links/${link.id}/edit`)}
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
                                      class="lucide lucide-pencil"
                                    >
                                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                      <path d="m15 5 4 4" />
                                    </svg>
                                    <span>Edit</span>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]"
                                    onSelect={async () => {
                                      await toggleLinkActive.mutateAsync({
                                        id: link.id,
                                        active: !link.active,
                                      });
                                      await queryClient.invalidateQueries(["links"]);
                                    }}
                                  >
                                    <Switch>
                                      <Match when={toggleLinkActive.isLoading}>
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
                                      </Match>
                                      <Match when={link.active}>
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
                                          <path d="M12 2v10" />
                                          <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
                                        </svg>
                                      </Match>
                                      <Match when={!link.active}>
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
                                          <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
                                          <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
                                          <path d="M12 2v4" />
                                          <path d="m2 2 20 20" />
                                        </svg>
                                      </Match>
                                    </Switch>
                                    <span>{link.active ? "Disable" : "Enable"}</span>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Separator class="border-neutral-200 dark:border-neutral-800" />
                                  <DropdownMenu.Item
                                    class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 active:bg-red-100 dark:active:bg-red-800 font-medium items-center justify-start select-none min-w-[150px] text-red-500 dark:text-red-400 dark:hover:text-white dark:active:text-white"
                                    disabled={isDeleting}
                                    onSelect={() => confirmRemoveLink(link.id)}
                                    aria-label="Delete Project"
                                  >
                                    <Show
                                      when={isDeleting}
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
                                        >
                                          <path d="M3 6h18" />
                                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                          <line x1="10" x2="10" y1="11" y2="17" />
                                          <line x1="14" x2="14" y1="11" y2="17" />
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
                                        class="animate-spin"
                                      >
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                      </svg>
                                    </Show>
                                    <span>Delete</span>
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </div>
                        </div>
                        <div class="flex-row items-center gap-2.5 p-2.5 py-8 bg-neutral-100/10 dark:bg-neutral-900/10 flex-grow">
                          <div class="flex h-full">{link.meta.find((x) => x.name === "description")?.content}</div>
                        </div>
                        <div class="hidden md:flex flex-row items-center gap-2.5 p-2.5 bg-neutral-100 dark:bg-neutral-900">
                          <A
                            href={`${import.meta.env.VITE_API_URL}/link/${link.group}?type=${link.type}`}
                            rel="external"
                            target="_blank"
                            class="bg-black dark:bg-white rounded-md p-2.5 text-white dark:text-black font-bold flex flex-row gap-2.5 w-max items-center text-sm shadow-sm"
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
                            Open in new tab
                          </A>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            )}
          </Match>
        </Switch>
      </div>
    </div>
  );
}
