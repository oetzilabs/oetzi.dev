import { A, cache, createAsync, redirect, useParams, useSubmission } from "solid-start";
import { JSX, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";
import Markdown from "solid-marked/component";
import { cn } from "../../../utils/cn";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { Queries } from "../../../utils/api/queries";
import { Tabs } from "@kobalte/core";
import { debounce } from "@solid-primitives/scheduled";
import { Blogs } from "../../../utils/api/blog";
import { clientOnly } from "solid-start/islands";

const MilkdownEditor = clientOnly(() => import("../../../components/MD2"));

type TabValues = "editor" | "preview";

export default function BlogPage() {
  const { id } = useParams();
  if (!id) return redirect("/notfound", { status: 404 });
  const blog = createQuery(() => ({
    queryKey: ["blog", id],
    queryFn: () => Queries.blog(id),
    staleTime: 1000 * 60 * 60 * 24,
  }));
  const [editor, setEditor] = createSignal<string>(blog.isSuccess ? blog.data.content : "");
  const [title, setTitle] = createSignal<string>(blog.isSuccess ? blog.data.title : "");
  const saveEditor = debounce((value: string) => setEditor(value), 500);
  const saveTitle = debounce((value: string) => setTitle(value), 500);

  const createBlog = createMutation(() => ({
    mutationFn: (data: Parameters<typeof Blogs.create>[0]) => Blogs.create(data),
    mutationKey: ["createBlog"],
  }));

  createEffect(() => {
    document.title = title() + " | Blog | Oetzi.dev";
  });

  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <form method="post" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2.5">
          <div class="w-full flex flex-col gap-4">
            <input type="hidden" name="id" value={blog.isSuccess && blog.data ? blog.data.id : ""} />
            <input
              name="title"
              value={title()}
              onInput={(e) => {
                saveTitle(e.currentTarget.value);
              }}
              class="bg-transparent border border-neutral-300 dark:border-neutral-800 rounded-md px-2 py-1 text-lg font-medium w-full"
            />
            <textarea name="content" hidden value={editor()} />
            <MilkdownEditor
              value={editor()}
              onChange={(v) => {
                saveEditor(v);
              }}
            />
          </div>
        </div>
        <div class="w-full flex flex-row items-center justify-between">
          <div></div>
          <button
            disabled={createBlog.isPending}
            type="submit"
            class="bg-black dark:bg-white text-white dark:text-black rounded-md px-2 py-1 font-medium w-max disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </form>
    </main>
  );
}
