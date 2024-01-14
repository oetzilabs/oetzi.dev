import { Blog } from "@oetzidev/core/entities/blogs";
import { Project } from "@oetzidev/core/entities/projects";
import { ApiHandler, useQueryParam } from "sst/node/api";
import { error, getUser, json } from "./utils";

let gitHubFilesCache: Record<
  string,
  {
    content: string;
    path: string;
  }[]
> = {};

export const allProjects = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  const searchParam = useQueryParam("search");
  const search = searchParam ? searchParam : "";

  const result = await Project.allByUser(user.id, { search });
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const allBlogs = ApiHandler(async (_evt) => {
  const searchParam = useQueryParam("search");
  const search = searchParam ? searchParam : "";

  let result = [];
  if (search === "") {
    result = await Blog.all();
    return json(result);
  }
  result = await Blog.allWithSearch({
    search,
  });
  return json(result);
});

export const getProject = ApiHandler(async (_evt) => {
  const id = useQueryParam("id");
  if (!id) {
    return error("No id");
  }
  const result = await Project.findById(id);
  if (!result) {
    return error("Project not found");
  }
  return json(result);
});

export const getBlog = ApiHandler(async (_evt) => {
  const id = useQueryParam("id");
  if (!id) {
    return error("No id");
  }
  const result = await Blog.findById(id);
  if (!result) {
    return error("Blog not found");
  }
  return json(result);
});
