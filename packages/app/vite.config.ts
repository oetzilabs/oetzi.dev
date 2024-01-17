import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  start: {
    server: {
      preset: "aws-lambda",
      plugins: ["solid-start-ssr"],
    },
    ssr: true,
  },
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message", "@milkdown/design-system"],
  },
});
