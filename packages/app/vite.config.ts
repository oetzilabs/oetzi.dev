import { defineConfig } from "@solidjs/start/config";
import aws from "solid-start-sst";

export default defineConfig({
  start: {
    server: {
      preset: "aws-lambda",
    },
  },
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message"],
  },
});
