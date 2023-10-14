import { createMutation } from "@tanstack/solid-query";
import { Mutations } from "../utils/api/mutations";
import { Modal } from "./Modal";
import { useAuth } from "./Auth";
import { createSignal } from "solid-js";

export default function NewProject() {
  const [user] = useAuth();
  const createProject = createMutation(async (input: Parameters<typeof Mutations.createProject>[1]) => {
    let u = user();
    if (!u) return;
    if (!u.isAuthenticated) return;
    if (!u.token) return;

    return Mutations.createProject(u.token, input);
  });

  const [modalOpen, setModalOpen] = createSignal(false);

  return (
    <Modal
      open={modalOpen()}
      onOpenChange={setModalOpen}
      title=""
      trigger={
        <button class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span class="font-bold select-none">Create Project</span>
        </button>
      }
    >
      <div class="w-full flex flex-col gap-2.5">
        <label class="text-sm font-medium">Name</label>
        <input
          type="text"
          class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"
        />
        <label class="text-sm font-medium">Description</label>
        <textarea class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800"></textarea>
        <div class="flex flex-row items-center justify-end gap-2.5">
          <button
            class="p-2 py-1 flex items-center justify-center bg-black dark:bg-white gap-2.5 hover:bg-neutral-950 rounded-md active:bg-neutral-900 dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-black"
            onClick={async () => {
              await createProject.mutateAsync({
                name: "test",
                description: "test",
                protected: "",
                visibility: "public",
              });
              setModalOpen(false);
            }}
          >
            <span class="font-bold select-none">Create</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
