import { A, cache, createAsync, redirect, useParams } from "@solidjs/router";
import { JSX, Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";
import Markdown from "solid-marked/component";
import { cn } from "../../../utils/cn";
import { createQuery } from "@tanstack/solid-query";
import { Queries } from "../../../utils/api/queries";
import { Tabs } from "@kobalte/core";
import { debounce } from "@solid-primitives/scheduled";
import { Blogs } from "../../../utils/api/blog";

type TabValues = "editor" | "preview";

export default function ProjectPage() {
  const { id } = useParams();
  if (!id) return redirect("/notfound", { status: 404 });
  const blog = createQuery(() => ({
    queryKey: ["blog"],
    queryFn: () => Queries.blog(id),
  }));
  const [activeTab, setActiveTab] = createSignal<TabValues>("editor");
  const [editor, setEditor] = createSignal<string>(blog.isSuccess ? blog.data.content : "");
  const [title, setTitle] = createSignal<string>(blog.isSuccess ? blog.data.title : "");
  const saveEditor = debounce((value: string) => setEditor(value), 500);
  const saveTitle = debounce((value: string) => setTitle(value), 500);

  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <form action={Blogs.update} method="post" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2.5 p-2 border border-neutral-300 dark:border-neutral-800 rounded-md">
          <div class="flex flex-row gap-2.5 p-2 border border-neutral-300 dark:border-neutral-800 rounded-md">
            <button
              type="button"
              value="editor"
              class={cn("flex-1", {
                "bg-black dark:bg-white text-white dark:text-black": activeTab() === "editor",
                "bg-white dark:bg-black text-black dark:text-white": activeTab() === "preview",
              })}
              onClick={() => setActiveTab("editor")}
            >
              Editor
            </button>
            <button
              type="button"
              value="editor"
              class={cn("flex-1", {
                "bg-black dark:bg-white text-white dark:text-black": activeTab() === "preview",
                "bg-white dark:bg-black text-black dark:text-white": activeTab() === "editor",
              })}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
          </div>
          <Switch>
            <Match when={activeTab() === "editor"}>
              <div class="w-full flex flex-col gap-2">
                <input type="hidden" name="id" value={blog.isSuccess ? blog.data.id : ""} />
                <input
                  type="hidden"
                  name="title"
                  value={title()}
                  onInput={(e) => {
                    saveTitle(e.currentTarget.value);
                  }}
                />
                <textarea
                  name="content"
                  class="w-full h-96 p-4 rounded-md border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                  onInput={(e) => {
                    saveEditor(e.currentTarget.value);
                  }}
                >
                  {editor()}
                </textarea>
              </div>
            </Match>
            <Match when={activeTab() === "preview"}>
              <div class="w-full h-96 p-4 rounded-md border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                <Markdown
                  builtins={{
                    Strong(props): JSX.Element {
                      return <strong class="font-bold">{props.children}</strong>;
                    },
                    Heading(props): JSX.Element {
                      return (
                        <Dynamic
                          component={`h${props.depth}`}
                          class={cn("font-bold", {
                            "text-xl": props.depth === 1,
                            "text-lg": props.depth === 2,
                            "text-md": props.depth === 3,
                            "text-sm": props.depth === 4,
                            "text-xs": props.depth === 5,
                          })}
                          id={props.id}
                        >
                          {props.children}
                        </Dynamic>
                      );
                    },
                    Paragraph(props): JSX.Element {
                      return <p class="">{props.children}</p>;
                    },
                    Root(props): JSX.Element {
                      return <div class="flex flex-col gap-6">{props.children}</div>;
                    },
                    Break(): JSX.Element {
                      return <br />;
                    },
                    ThematicBreak(): JSX.Element {
                      return <div class="w-full h-[1px] bg-neutral-300 dark:bg-neutral-700 my-4" />;
                    },
                    Blockquote(props): JSX.Element {
                      return <blockquote>{props.children}</blockquote>;
                    },
                    Image(props): JSX.Element {
                      return <img src={props.url} alt={props.alt ?? props.title ?? undefined} />;
                    },
                    Code(props): JSX.Element {
                      return (
                        <code class="flex flex-col p-2 bg-black dark:bg-white rounded-md text-white dark:text-black leading-none">
                          {props.children}
                        </code>
                      );
                    },
                    InlineCode(props): JSX.Element {
                      return (
                        <code class="flex flex-col p-1 px-2 text-sm w-max bg-black dark:bg-white rounded-md text-white dark:text-black leading-none">
                          {props.children}
                        </code>
                      );
                    },
                    Emphasis(props): JSX.Element {
                      return <em>{props.children}</em>;
                    },
                    List(props): JSX.Element {
                      return (
                        <Dynamic
                          component={props.ordered ? "ol" : "ul"}
                          start={props.start ?? undefined}
                          class="inline-flex flex-col flex-wrap gap-0.5"
                        >
                          {props.children}
                        </Dynamic>
                      );
                    },
                    ListItem(props): JSX.Element {
                      return (
                        <li class="inline-flex flex-row flex-wrap gap-2">
                          <Show when={props.checked != null} fallback={props.children}>
                            <input type="checkbox" checked={props.checked ?? undefined} />
                            {props.children}
                          </Show>
                        </li>
                      );
                    },
                    Link(props): JSX.Element {
                      return (
                        <A
                          href={props.url}
                          target={["./", "/"].some((x) => props.url.startsWith(x)) ? undefined : "_blank"}
                          title={props.title ?? undefined}
                          class="text-blue-700 dark:text-blue-500 hover:underline"
                        >
                          {props.children}
                        </A>
                      );
                    },
                  }}
                >
                  {editor()}
                </Markdown>
              </div>
            </Match>
          </Switch>
        </div>
        <button type="submit" class="bg-black dark:bg-white text-white dark:text-black rounded-md p-2 font-medium">
          Save
        </button>
      </form>
    </main>
  );
}
