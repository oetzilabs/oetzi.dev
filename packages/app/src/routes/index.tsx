import { A, cache, createAsync } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";
import { PublicProject } from "../components/PublicProject";
import { Session } from "../utils/api/session";

const getProjects = cache(Session.getProjects, "projects");

export const route = {
  load: () => getProjects(),
};

export default function Home() {
  const projectsData = createAsync(getProjects);
  const projects = () => projectsData() ?? [];
  const isLoggedIn = Session.isLoggedIn();
  const [open, setOpen] = createSignal(true);

  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <div class="w-full flex flex-col gap-10 py-4">
        <div class="w-full flex flex-row gap-2 items-center justify-between">
          <h1 class="text-4xl font-bold select-none">Projects</h1>
          <div class="flex flex-row gap-2 items-center">
            <Show when={isLoggedIn()}>
              <A
                href="/project/create"
                class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-sm px-2 py-1 font-medium"
              >
                Create Project
              </A>
            </Show>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <For
            each={projects()}
            fallback={
              <div class="col-span-full flex flex-col items-start justify-center rounded-sm p-10 gap-8 border border-neutral-300 dark:border-neutral-800">
                <h3 class="text-xl font-bold">No projects found.</h3>
                <p class="text-md font-medium">Ötzi has currently no projects published.</p>
              </div>
            }
          >
            {(project) => <PublicProject project={project} />}
          </For>
        </div>
      </div>
    </main>
  );
}
