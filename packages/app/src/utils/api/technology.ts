import { redirect } from "solid-start";
import { Mutations } from "./mutations";
import { parseCookie } from "solid-start";

export * as Technologies from "./technology";

export const create = async (props: Parameters<typeof Mutations.Technologies.create>[1]) => {
  const token = parseCookie(document.cookie)["session"];
  if (!token) {
    throw new Error("Not logged in");
  }
  const createdBlog = await Mutations.Technologies.create(token, props);
  return redirect(`/technologies/${createdBlog.id}`);
};

export const update = async (props: Parameters<typeof Mutations.Technologies.update>[1]) => {
  const token = parseCookie(document.cookie)["session"];
  if (!token) {
    throw new Error("Not logged in");
  }
  const createdBlog = await Mutations.Technologies.update(token, props);
  return redirect(`/technologies/${createdBlog.id}`);
};

export const remove = async (props: Parameters<typeof Mutations.Technologies.remove>[1]) => {
  const token = parseCookie(document.cookie)["session"];
  if (!token) {
    throw new Error("Not logged in");
  }
  const removedBlog = await Mutations.Technologies.remove(token, props);
  return removedBlog;
};
