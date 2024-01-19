import { redirect } from "solid-start";
import { Mutations } from "./mutations";
import { getRequestEvent } from "solid-js/web";
import { parseCookie } from "solid-start";

export * as Project from "./project";

export const create = async (props: Parameters<typeof Mutations.Projects.create>[1]) => {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event");
  }
  const token = parseCookie(document.cookie)["session"];
  if (!token) {
    throw new Error("Not logged in");
  }
  const createdProject = await Mutations.Projects.create(token, props);
  return redirect(`/project/${createdProject.id}`);
};

export const remove = async (id: string) => {
  "use server";
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event");
  }
  const token = parseCookie(document.cookie)["session"];
  if (!token) {
    throw new Error("Not logged in");
  }
  const removedProject = await Mutations.Projects.remove(token, id);
  return removedProject;
};
