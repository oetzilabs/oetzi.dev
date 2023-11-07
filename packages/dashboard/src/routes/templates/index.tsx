import { createQuery } from "@tanstack/solid-query";
import { For, JSX, Show } from "solid-js";
import { useAuth } from "../../components/providers/OfflineFirst";
import { Queries } from "../../utils/api/queries";
import { cn } from "../../utils/cn";
import type { PluginConfigT, PluginConfig } from "../../../../functions/src/plugins";

const InputElement = <T extends PluginConfigT>(props: { key: string; configValue: T }): JSX.Element => {
  const _class = cn(
    "flex bg-transparent focus:ring-0 focus:outline-none border rounded-sm p-2 border-neutral-200 dark:border-neutral-800"
  );
  switch (props.configValue.type) {
    case "boolean":
      return <input class={_class} type="checkbox" name={props.key} checked={props.configValue.value} />;
    case "selection":
      return (
        <select class={_class} name={props.key} value={props.configValue.defaultValue?.[0].value ?? undefined}>
          <For each={props.configValue.value}>
            {(option) => (
              <option class={_class} id={option.key} value={option.value}>
                {option.value}
              </option>
            )}
          </For>
        </select>
      );
    case "string":
      return (
        <input class={_class} type="text" name={props.key} placeholder={props.key} value={props.configValue.value} />
      );
    case "number":
      return (
        <input class={_class} type="number" name={props.key} placeholder={props.key} value={props.configValue.value} />
      );
    default:
      // @ts-expect-error
      const x = configValue.type;
      return ""; // Handle other types as needed
  }
};
const Form = (props: { plugins: Array<PluginConfig<Record<string, PluginConfigT>>> }) => {
  return (
    <For each={props.plugins}>
      {(plugin) => (
        <For each={Object.keys(plugin.configData)}>
          {(key) => <InputElement key={key} configValue={plugin.configData[key]} />}
        </For>
      )}
    </For>
  );
};

export default function TemplatesPage() {
  const [user] = useAuth();
  const plugins = createQuery(
    () => ["plugins"],
    () => {
      const u = user();
      if (!u.isLoading && !u.isAuthenticated) return Promise.reject("Not authenticated");
      const token = u.token;
      if (!token) return Promise.reject("Not authenticated");
      return Queries.Plugins.all(token);
    },
    {
      staleTime: Infinity,
      get enabled() {
        const u = user();
        return !u.isLoading && u.isAuthenticated;
      },
    }
  );

  return (
    <div class="container mx-auto flex flex-col gap-2 py-10">
      <form class="w-full flex flex-col gap-4 items-start bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-4">
        <Show when={plugins.isSuccess && plugins.data}>{(ps) => <Form plugins={ps()} />}</Show>
      </form>
    </div>
  );
}
