import { ApiHandler, useFormData, useQueryParam, useQueryParams } from "sst/node/api";
import { AllWithFilterZod, Project } from "../../core/src/entities/projects";
import { error, getUser, json } from "./utils";
import { StatusCodes } from "http-status-codes";

export const create = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  if (!user) return error("Not logged in");
  const form = useFormData();
  if (!form) return error("No form data");
  const d = Object.fromEntries(form.entries());
  const projectInput = Project.safeParse(d);
  if (!projectInput.success) {
    console.log(d, projectInput.error.flatten().fieldErrors);
    return error("Invalid data");
  }

  const result = await Project.create(user.id, projectInput.data);

  return json(result);
});

export const remove = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  if (!user) return error("Not logged in");
  const form = useFormData();
  if (!form) return error("No form data");
  const projectId = form.get("id");
  if (!projectId) return error("No project id");
  const result = await Project.remove(user.id, projectId);

  return json(result);
});

export const all = ApiHandler(async (_evt) => {
  const p = useQueryParams();
  if (!p) {
    const result = await Project.all();
    return json(result);
  }
  const filterSP = AllWithFilterZod.safeParse(p);
  if (filterSP.success) {
    const result = await Project.allWithFilter(filterSP.data);
    return json(result);
  }

  return json([]);
});
export const get = ApiHandler(async (_evt) => {
  const p = useQueryParam("id");
  if (!p) {
    return error("No id");
  }
  const result = await Project.findById(p);
  if (result) {
    return json(result);
  }

  return error("Project not found", StatusCodes.NOT_FOUND);
});
