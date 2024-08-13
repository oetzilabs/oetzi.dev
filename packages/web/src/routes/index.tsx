import { A } from "@solidjs/router";
import ModeToggle from "@/components/ModeToggle";
import { Image, ImageFallback, ImageRoot } from "../components/ui/image";

export default function Home() {
  // I'm trying to tell the user that I'm a developer, and this is just a placeholder webpage for now. I use this domain to host my personal projects and different utilities. I will be using this domain for my personal website in the future.
  return (
    <main class="flex flex-col gap-2 py-10 items-center justify-center h-screen w-screen">
      <div class="w-max flex flex-col gap-4 items-center justify-center md:-mt-24">
        <div class="w-full flex flex-col gap-4 items-center justify-center border border-neutral-300 dark:border-neutral-700 p-2 rounded-lg shadow-xl z-0">
          <div class="w-full flex grow flex-row gap-2 items-center justify-between">
            <div class="w-full flex flex-row gap-2 items-center">
              <ImageRoot class="size-8">
                <Image src="/avatar.png" />
                <ImageFallback></ImageFallback>
              </ImageRoot>
              <span class="text-lg font-bold font-mono">oetzi.dev</span>
            </div>
            <div class="w-max">
              <ModeToggle />
            </div>
          </div>
          <div class="flex flex-col gap-2 items-center justify-center bg-muted p-4 rounded-sm font-mono">
            <span class="text-xs font-semibold">I use this domain to host my development</span>
            <span class="text-xs font-semibold">projects and different utilities.</span>
          </div>
        </div>
        <div class="w-full flex flex-col gap-4 items-center justify-center border border-neutral-300 dark:border-neutral-700 p-2 py-4 rounded-lg z-10 bg-background shadow-xl">
          <div class="w-full flex grow flex-col gap-2 items-center justify-center font-mono">
            <span class="text-sm">You can also find me on:</span>
            <div class="flex flex-row gap-2 items-center justify-center">
              <A href="https://github.com/oezguerisbert" class="text-xs font-semibold">
                GitHub
              </A>
              <A href="https://twitter.com/oezguerisbert" class="text-xs font-semibold">
                Twitter
              </A>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
