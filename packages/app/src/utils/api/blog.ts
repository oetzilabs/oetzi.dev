import { redirect } from "solid-start";
import { Mutations } from "./mutations";
import { parseCookie } from "solid-start";

export * as Blogs from "./blog";

export const create = async (props: Parameters<typeof Mutations.Blogs.create>[1]) => {
  const token = parseCookie(document.cookie)["session"];
  if (!token) {
    throw new Error("Not logged in");
  }
  const createdBlog = await Mutations.Blogs.create(token, props);
  return redirect(`/blog/${createdBlog.id}`);
};

export const update = async (formdata: FormData) => {
  const token = parseCookie(document.cookie)["session"];
  if (!token) {
    throw new Error("Not logged in");
  }
  const data = Object.fromEntries(formdata.entries());
  const validation = Mutations.BlogsUpdateZod.safeParse(data);
  if (!validation.success) {
    throw validation.error;
  }
  const createdBlog = await Mutations.Blogs.update(token, validation.data);
  return redirect(`/blog/${createdBlog.id}`);
};

export const remove = async (props: Parameters<typeof Mutations.Blogs.remove>[1]) => {
  const token = parseCookie(document.cookie)["session"];
  if (!token) {
    throw new Error("Not logged in");
  }
  const removedBlog = await Mutations.Blogs.remove(token, props);
  return removedBlog;
};
