import { A } from "@solidjs/router";
import ModeToggle from "@/components/ModeToggle";
import { Image, ImageFallback, ImageRoot } from "../components/ui/image";

export default function PageNotFound() {
  return (
    <main class="flex flex-col gap-2 py-10 items-center justify-center h-screen w-screen">
      <div class="w-max flex flex-col gap-4 items-center justify-center md:-mt-24">
        <div class="w-full flex flex-col gap-4 items-center justify-center border border-neutral-300 dark:border-neutral-700 p-2 rounded-lg">
          <div class="flex flex-col gap-2 items-center justify-center bg-background p-4 rounded-sm font-mono">
            <span class="text-sm ">This page does not exist.</span>
            <span class="text-sm">
              Go back to the{" "}
              <A href="/" class=" font-semibold underline underline-offset-2">
                home page
              </A>
              .
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
