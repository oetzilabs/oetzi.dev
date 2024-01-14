import { action, redirect } from "@solidjs/router";
import { Mutations } from "./mutations";
import { getCookie } from "vinxi/server";
import { getRequestEvent } from "solid-js/web";

export * as Blogs from "./blog";

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
  const validation = Mutations.BlogsCreateZod.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  const createdBlog = await Mutations.Blogs.create(token, validation.data);
  return redirect(`/blog/${createdBlog.id}`);
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
  const validation = Mutations.BlogsRemoveZod.safeParse(data);
  if (!validation.success) {
    console.log(validation.error.flatten().fieldErrors);
    throw validation.error;
  }
  const removedBlog = await Mutations.Blogs.remove(token, validation.data.id);
  return removedBlog;
});
