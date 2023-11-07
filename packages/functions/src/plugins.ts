import { ApiHandler } from "sst/node/api";

type SelectionT = { key: string; value: any };

export type PluginConfigT = {
  placeholder: string;
} & (
  | {
      type: "string";
      value: string;
      defaultValue?: string;
    }
  | {
      type: "number";
      defaultValue?: number;
      value?: number;
    }
  | {
      type: "boolean";
      value: boolean;
      defaultValue?: boolean;
    }
  | {
      type: "selection";
      value: SelectionT[];
      defaultValue?: [SelectionT, ...SelectionT[]];
    }
);

export type PluginConfig<T extends Record<string, PluginConfigT>> = {
  id: string;
  pluginName: string;
  configData: T;
};

// Plugin Configuration Models
export const createPlugin = <T extends Record<string, PluginConfigT>>(
  id: string,
  pluginName: string,
  configData: T
): PluginConfig<T> => ({
  id,
  pluginName,
  configData,
});

export const all = ApiHandler(async (event) => {
  const plugins: PluginConfig<any>[] = [
    createPlugin("123", "MyPlugin", {
      name: {
        type: "string",
        value: "My Plugin",
        placeholder: "Plugin Name",
      },
      options: {
        type: "selection",
        defaultValue: [{ key: "option1", value: "Option 1" }],
        value: [
          { key: "option1", value: "Option 1" },
          { key: "option2", value: "Option 2" },
          { key: "option3", value: "Option 3" },
        ],
        placeholder: "Select an option",
      },
      count: {
        type: "number",
        value: 1,
        placeholder: "Enter a number",
      },
    }),
  ];
  return {
    statusCode: 200,
    body: JSON.stringify(plugins),
    headers: {
      "Content-Type": "application/json",
    },
  };
});
