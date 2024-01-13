import { action } from "@solidjs/router";
import { Project } from "../../utils/api/project";

export default function CreateProjectPage() {
  const createProject = action(Project.create);
  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <form action={createProject} method="post" class="flex flex-col gap-2">
        <input
          type="text"
          name="name"
          placeholder="Name"
          class="bg-white dark:bg-black text-sm rounded-sm px-2 py-1 font-medium border border-neutral-300 dark:border-neutral-800"
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          class="bg-white dark:bg-black text-sm rounded-sm px-2 py-1 font-medium border border-neutral-300 dark:border-neutral-800"
        />
        <input
          type="text"
          name="remote"
          placeholder="Remote"
          class="bg-white dark:bg-black text-sm rounded-sm px-2 py-1 font-medium border border-neutral-300 dark:border-neutral-800"
        />
        <input
          type="text"
          name="visibility"
          placeholder="Visibility: public, private"
          class="bg-white dark:bg-black text-sm rounded-sm px-2 py-1 font-medium border border-neutral-300 dark:border-neutral-800"
        />
        <button
          type="submit"
          class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-sm px-2 py-1 font-medium hover:underline"
        >
          Create
        </button>
      </form>
    </main>
  );
}
