import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorMode } from "@kobalte/core";
import { Monitor, MoonIcon, Sun } from "lucide-solid";
import { Show } from "solid-js";

const ModeToggle = () => {
  const { setColorMode, colorMode } = useColorMode();

  return (
    <DropdownMenu placement="bottom-end">
      <DropdownMenuTrigger as={Button} variant="outline" size="icon" class="size-8 items-center justify-center flex">
        <Show when={colorMode() === "dark"} fallback={<MoonIcon class="size-4" />}>
          <Sun class="size-4" />
        </Show>
        <span class="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="min-w-[8rem]">
        <DropdownMenuItem onSelect={() => setColorMode("light")} class="flex flex-row gap-2">
          <Sun class="size-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("dark")} class="flex flex-row gap-2">
          <MoonIcon class="size-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setColorMode("system")} class="flex flex-row gap-2">
          <Monitor class="size-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeToggle;
