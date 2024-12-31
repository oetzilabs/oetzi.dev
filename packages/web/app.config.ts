import { resolve } from "node:path";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "aws-lambda",
    compatibilityDate: "2024-11-23",
    awsLambda: {
      streaming: true,
    },
  },
  vite: {
    ssr: { noExternal: ["@kobalte/core", "@internationalized/message"] },
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
  },
});
