import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import { onCleanup, onMount } from "solid-js";

export default function Milkdown(props: { value: string; onChange: (value: string) => void }) {
  let ref: HTMLDivElement;
  let editor: Editor;
  onMount(() => {
    editor = new Editor({
      el: ref,
      initialValue: props.value,
      theme: "dark",
      height: "80vh",
      initialEditType: "wysiwyg",
      events: {
        change: () => {
          let x = editor.getMarkdown();
          props.onChange(x);
        },
      },
    });
  });
  onCleanup(() => {
    editor.destroy();
  });
  return <div ref={ref!} />;
}
