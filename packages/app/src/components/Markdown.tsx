import { A } from "solid-start";
import { JSX, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import Markdown from "solid-marked/component";
import { cn } from "../utils/cn";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index";
import "prismjs/themes/prism-dark.min.css";
loadLanguages.silent = true;

const PrismHighlight = (props: { children: string; language: string }) => {
  loadLanguages();
  const html = Prism.highlight(props.children, Prism.languages[props.language], props.language);
  return (
    <div class="text-sm font-mono p-2 border border-neutral-300 dark:border-neutral-800 rounded-md" innerHTML={html} />
  );
};

export default function Mdd(props: { children: string }) {
  return (
    <div class="prose-md dark:prose-headings:text-white dark:prose-p:text-white">
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
            return <PrismHighlight language={props.lang ?? "text"}>{props.children ?? ""}</PrismHighlight>;
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
        {props.children}
      </Markdown>
    </div>
  );
}
