import { TextField } from "@kobalte/core";
import { debounce } from "@solid-primitives/scheduled";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { Show, createSignal } from "solid-js";
import { Queries } from "~/utils/api/queries";
import { Technologies } from "~/utils/api/technology";
import { isLoggedIn } from "../../components/providers/Auth";

export default function ProjectConfigurationTechnologiesPage() {
  const technologies = createQuery(() => ({
    queryKey: ["technologies"],
    queryFn: () => Queries.technologies(),
  }));

  const addTech = createMutation(() => ({
    mutationFn: (props: Parameters<typeof Technologies.create>[0]) => {
      if (technologies.isSuccess && technologies.data) {
        if (technologies.data.find((t) => t.name === props.name)) {
          return Promise.reject("Technology already exists");
        }
      }
      return Technologies.create(props);
    },
    mutationKey: ["addTechToProject"],
  }));

  const [tech, setTech] = createSignal<Parameters<typeof addTech.mutateAsync>[0]>({
    name: "",
    description: "",
  });
  const setTechDebounce = debounce((value: Parameters<typeof addTech.mutateAsync>[0]) => setTech(value), 500);

  return (
    <Show when={isLoggedIn()}>
      <main class="flex container mx-auto flex-col gap-10 py-10">
        <h1 class="text-3xl font-bold select-none">Technologies</h1>
        <TextField.Root class="flex flex-col gap-4">
          <TextField.Label>Name</TextField.Label>
          <TextField.Input
            value={tech().name}
            onInput={(e) => setTechDebounce({ ...tech(), name: e.currentTarget.value })}
            class="w-full max-w-md bg-transparent border border-neutral-300 dark:border-neutral-800 rounded-md px-2 py-1 text-sm font-medium"
          />
        </TextField.Root>
        <TextField.Root class="flex flex-col gap-4">
          <TextField.Label>Description</TextField.Label>
          <TextField.Input
            value={tech().description}
            onInput={(e) => setTechDebounce({ ...tech(), description: e.currentTarget.value })}
            class="w-full max-w-md bg-transparent border border-neutral-300 dark:border-neutral-800 rounded-md px-2 py-1 text-sm font-medium"
          />
        </TextField.Root>
        <button
          class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-sm px-2 py-1 font-medium w-max"
          onClick={async () => await addTech.mutateAsync(tech())}
        >
          Create Technology
        </button>
      </main>
    </Show>
  );
}
