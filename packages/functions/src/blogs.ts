import { ApiHandler, useFormData, useQueryParam, useQueryParams } from "sst/node/api";
import { getUser, json } from "./utils";
import { AllWithFilterZod, Blog } from "../../core/src/entities/blogs";

export const create = ApiHandler(async (_evt) => {
  const [user] = await getUser();
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
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const blogId = form.get("id");
  if (!blogId) throw new Error("No project id");
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
