import { redirect, useParams } from "@solidjs/router";

export default function ProjectPage() {
  const { id } = useParams();
  if (!id) return redirect("./");
  return (
    <main class="flex container mx-auto flex-col gap-10 py-10">
      <h1 class="text-4xl font-bold select-none">Project: {id}</h1>
    </main>
  );
}
