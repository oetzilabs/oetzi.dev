import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { Mutations } from "../utils/api/mutations";
import { useAuth } from "./providers/OfflineFirst";
import { Queries } from "../utils/api/queries";

export const EditLink = (props: { id: string }) => {
  const [user] = useAuth();
  const queryClient = useQueryClient();
  const [linkToUpdate, setLink] = createSignal<Parameters<typeof Mutations.Links.update>[1]>({
    group: "",
    type: "",
    id: props.id,
    url: "",
    protected: "", // length 0 means no password
  });

  const link = createQuery(
    () => ["links", props.id],
    () => {
      const u = user();
      if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");

      return Queries.Links.get(token, props.id);
    },
    {
      get enabled() {
        const u = user();
        return !u.isLoading && u.isAuthenticated;
      },
      refetchInterval: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  createEffect(() => {
    if (link.isSuccess) {
      setLink(link.data);
    }
  });

  const updateLink = createMutation((link: Parameters<typeof Mutations.Links.update>[1]) => {
    const u = user();
    if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
    const token = u.token;
    if (!token) return Promise.reject("You are not logged in.");

    return Mutations.Links.update(token, link);
  });

  return (
    <div class="container mx-auto flex flex-col gap-4 py-10">
      <div class="w-full flex flex-col gap-4">
        <div class="w-full flex flex-col gap-2.5">
          <label class="font-medium">URL</label>
          <input
            disabled={link.isLoading}
            type="text"
            class="w-full border border-black/[0.05] dark:border-white/[0.05] rounded-md p-2.5 bg-black/[0.01] dark:bg-white/[0.01]"
            value={linkToUpdate().url}
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
            disabled={link.isLoading}
            type="text"
            class="w-full border border-black/[0.05] dark:border-white/[0.05] rounded-md p-2.5 bg-black/[0.01] dark:bg-white/[0.01]"
            value={linkToUpdate().group}
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
            disabled={link.isLoading}
            type="text"
            class="w-full border border-black/[0.05] dark:border-white/[0.05] rounded-md p-2.5 bg-black/[0.01] dark:bg-white/[0.01]"
            value={linkToUpdate().type}
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
            disabled={link.isLoading}
            type="password"
            class="w-full border border-black/[0.05] dark:border-white/[0.05] rounded-md p-2.5 bg-black/[0.01] dark:bg-white/[0.01]"
            value={linkToUpdate().protected}
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
          disabled={link.isLoading || updateLink.isLoading}
          class="w-full bg-black dark:bg-white hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black p-2.5 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={async () => {
            const l = linkToUpdate();
            const x = await updateLink.mutateAsync(l);
            await queryClient.invalidateQueries(["links"]);
            await queryClient.invalidateQueries(["links", props.id]);
          }}
        >
          <Switch>
            <Match when={updateLink.isLoading}>Saving</Match>
            <Match when={updateLink.isSuccess}>Saved</Match>
            <Match when={updateLink.isError}>Failed to Save</Match>
            <Match when={updateLink.isIdle}>Save</Match>
          </Switch>
        </button>
        <Show when={updateLink.isError}>
          {updateLink.error instanceof Error ? updateLink.error.message : "Unknown error"}
        </Show>
      </div>
    </div>
  );
};
