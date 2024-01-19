import { A } from "solid-start";
import { createQuery } from "@tanstack/solid-query";
import { For, Show } from "solid-js";
import { PublicBlog } from "../components/PublicBlog";
import { PublicProject } from "../components/PublicProject";
import { isLoggedIn } from "../components/providers/Auth";
import { Queries } from "../utils/api/queries";

export default function Home() {
  const projects = createQuery(() => ({
    queryKey: ["projects"],
    queryFn: () => Queries.projects(),
  }));

  const blogs = createQuery(() => ({
    queryKey: ["blogs"],
    queryFn: () => Queries.blogs(),
  }));

  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <div class="w-full flex flex-col gap-10 py-4">
        <div class="w-full flex flex-row gap-2 items-center justify-between">
          <h1 class="text-4xl font-bold select-none">Blogs</h1>
          <div class="flex flex-row gap-2 items-center">
            <Show when={isLoggedIn()}>
              <a
                href="/blog/create"
                class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-sm px-2 py-1 font-medium"
              >
                Create Blog
              </a>
            </Show>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <For
            each={blogs.isSuccess && blogs.data}
            fallback={
              <div class="col-span-full flex flex-col items-start justify-center rounded-sm p-10 gap-8 border border-neutral-300 dark:border-neutral-800">
                <h3 class="text-xl font-bold">No blogs found.</h3>
                <p class="text-md font-medium">I currently have no blogs published.</p>
              </div>
            }
          >
            {(blog) => <PublicBlog blog={blog} />}
          </For>
        </div>
      </div>
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
            each={projects.isSuccess && projects.data}
            fallback={
              <div class="col-span-full flex flex-col items-start justify-center rounded-sm p-10 gap-8 border border-neutral-300 dark:border-neutral-800">
                <h3 class="text-xl font-bold">No projects found.</h3>
                <p class="text-md font-medium">I currently have no projects published.</p>
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
