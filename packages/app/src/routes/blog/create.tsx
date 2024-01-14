import { useSubmission } from "@solidjs/router";
import { Blogs } from "../../utils/api/blog";

export default function CreateProjectPage() {
  const createProjectSubmission = useSubmission(Blogs.create);
  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <form action={Blogs.create} method="post" class="flex flex-col gap-2">
        <input
          type="text"
          name="title"
          placeholder="Title"
          class="bg-white dark:bg-black text-sm rounded-sm px-2 py-1 font-medium border border-neutral-300 dark:border-neutral-800"
        />
        <input
          type="text"
          name="visibility"
          placeholder="Visibility: public or private"
          class="bg-white dark:bg-black text-sm rounded-sm px-2 py-1 font-medium border border-neutral-300 dark:border-neutral-800"
        />
        <textarea
          name="content"
          placeholder="Name"
          class="bg-white dark:bg-black text-sm rounded-sm px-2 py-1 font-medium border border-neutral-300 dark:border-neutral-800"
        />
        <button
          type="submit"
          class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-sm px-2 py-1 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={createProjectSubmission.pending}
        >
          Create
        </button>
      </form>
    </main>
  );
}
