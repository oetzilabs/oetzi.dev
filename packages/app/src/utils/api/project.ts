import { action, redirect } from "@solidjs/router";
import { Mutations } from "./mutations";
import { getCookie } from "vinxi/server";
import { getRequestEvent } from "solid-js/web";

export * as Project from "./project";

export const create = action(async (formdata: FormData) => {
  "use server";
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event");
  }
  const token = getCookie(event, "session");
  if (!token) {
    throw new Error("Not logged in");
  }
  const data = Object.fromEntries(formdata.entries());
  const validation = Mutations.ProjectsCreateZod.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  const createdProject = await Mutations.Projects.create(token, validation.data);
  return redirect(`/projects/${createdProject.id}`);
});

export const remove = action(async (formdata: FormData) => {
  "use server";
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event");
  }
  const token = getCookie(event, "session");
  if (!token) {
    throw new Error("Not logged in");
  }
  const data = Object.fromEntries(formdata.entries());
  const validation = Mutations.ProjectsRemoveZod.safeParse(data);
  if (!validation.success) {
    console.log(validation.error.flatten().fieldErrors);
    throw validation.error;
  }
  const removedProject = await Mutations.Projects.remove(token, validation.data.id);
  return removedProject;
});
