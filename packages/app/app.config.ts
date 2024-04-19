import path from "node:path";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "aws-lambda",
    output: {
      dir: "dist",
      publicDir: "dist/client",
    },
    esbuild: {
      options: {
        target: "esnext",
        treeShaking: true,
      },
    },
  },
  vite: {
    ssr: { noExternal: ["@kobalte/core", "@internationalized/message"] },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
    build: {
      target: "esnext",
    },
  },
});
