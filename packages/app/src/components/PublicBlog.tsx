import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { For, JSX, Match, Show, Switch } from "solid-js";
import Markdown from "solid-marked/component";
import { Blogs } from "../utils/api/blog";
import { A, action } from "@solidjs/router";
import { Session } from "../utils/api/session";
import { Blog } from "@oetzidev/core/entities/blogs";
import { Dynamic } from "solid-js/web";
import { cn } from "../utils/cn";
dayjs.extend(relativeTime);

type PublicBlogProps = {
  blog: Blog.Frontend;
};

export const PublicBlog = (props: PublicBlogProps) => {
  const isLoggedIn = Session.isLoggedIn();
  return (
    <div class="flex flex-col text-black dark:text-white border border-neutral-300 dark:border-neutral-800 overflow-clip">
      <div class="flex flex-row items-center justify-between p-4 pb-2">
        <div class="w-full flex flex-row items-center justify-between gap-2.5">
          <A
            href={
              props.blog.visibility === "public"
                ? `/blog/${props.blog.id}`
                : isLoggedIn
                ? `/blog/${props.blog.id}/configure`
                : `/blog/${props.blog.id}`
            }
            class="text-xl font-bold hover:underline "
          >
            {props.blog.title}
          </A>
          <div class="flex flex-row items-center gap-2.5">
            <Show when={isLoggedIn}>
              <A
                href={`/blog/${props.blog.id}/configure`}
                class="flex flex-row gap-2.5 p-2 border border-neutral-300 dark:border-neutral-800 rounded-md"
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </A>
              <form action={Blogs.remove} method="post">
                <input type="hidden" name="id" value={props.blog.id} />
                <button type="submit" class="flex flex-row gap-2.5 text-rose-500 p-2 border border-rose-500 rounded-md">
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
                </button>
              </form>
            </Show>
          </div>
        </div>
        <div class="flex flex-row items-center gap-2.5"></div>
      </div>
      <div class="flex flex-row items-center justify-between p-4 pt-2">
        <div class="flex flex-row items-center gap-2.5">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">{dayjs(props.blog.createdAt).fromNow()}</p>
        </div>
        <div class="flex flex-row items-center gap-2.5">
          <div class="flex flex-row items-center gap-2.5">
            <p class="text-sm text-neutral-500 dark:text-neutral-400">{props.blog.visibility}</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2 p-4 max-h-40">
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
          {props.blog.content}
        </Markdown>
      </div>
    </div>
  );
};
