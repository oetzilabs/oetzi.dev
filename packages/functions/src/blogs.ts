import { ApiHandler, useFormData, useQueryParams } from "sst/node/api";
import { AllWithFilterZod, Blog } from "../../core/src/entities/blogs";
import { error, getUser, json } from "./utils";

export const create = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  if (!user) return error("Not logged in");
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const d = Object.fromEntries(form.entries());
  const blogInput = Blog.safeParse(d);
  if (!blogInput.success) {
    console.log(d, blogInput.error.flatten().fieldErrors);
    throw new Error("Invalid data");
  }

  const result = await Blog.create(user.id, blogInput.data);

  return json(result);
});

export const remove = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  if (!user) return error("Not logged in");
  const form = useFormData();
  if (!form) return error("No form data");
  const blogId = form.get("id");
  if (!blogId) return error("No blog id");
  const result = await Blog.remove(user.id, blogId);

  return json(result);
});

export const all = ApiHandler(async (_evt) => {
  const p = useQueryParams();
  if (!p) {
    const result = await Blog.all();
    return json(result);
  }
  const filterSP = AllWithFilterZod.safeParse(p);
  if (filterSP.success) {
    const result = await Blog.allWithFilter(filterSP.data);
    return json(result);
  }

  return json([]);
});

export const getBlog = ApiHandler(async (_evt) => {
  const p = useQueryParams();
  if (!p) return error("No query params");
  const id = p.id;
  if (!id) return error("No id");
  const b = await Blog.findById(id);
  if (!b) return error("No blog found");
  return json(b);
});

export const update = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  if (!user) return error("Not logged in");
  const formdata = useFormData();
  if (!formdata) return error("No form data");
  const d = Object.fromEntries(formdata.entries());
  const blogInput = Blog.safeParse(d);
  if (!blogInput.success) {
    console.log(d, blogInput.error.flatten().fieldErrors);
    return error("Invalid data");
  }
  const id = blogInput.data.id;
  if (!id) return error("No id");
  const result = await Blog.findById(id);
  if (!result) return error("No blog found");
  const updatedBlog = await Blog.update({
    id: result.id,
    title: blogInput.data.title,
    content: blogInput.data.content,
    visibility: blogInput.data.visibility,
  });

  return json(updatedBlog);
});
