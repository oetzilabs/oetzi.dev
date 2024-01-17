import { A, redirect, useParams } from "@solidjs/router";

import { createQuery } from "@tanstack/solid-query";
import Mdd from "../../../components/Markdown";
import { Queries } from "../../../utils/api/queries";
import { createEffect } from "solid-js";

export default function ProjectPage() {
  const { id } = useParams();
  if (!id) return redirect("/notfound", { status: 404 });
  const blog = createQuery(() => ({
    queryKey: ["blog", id],
    queryFn: () => Queries.blog(id),
  }));
  createEffect(() => {
    if (!blog.isSuccess) return;
    document.title = blog.data.title + " | Blog | Oetzi.dev";
  });
  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <div class="flex flex-row items-center justify-between">
        <div></div>
        <A
          href="./configure"
          class="bg-black dark:bg-white text-white dark:text-black rounded-md px-2 py-1 font-medium w-max"
        >
          Edit
        </A>
      </div>
      <Mdd>{blog.isSuccess && blog.data ? blog.data.content : "Loading..."}</Mdd>
    </main>
  );
}
