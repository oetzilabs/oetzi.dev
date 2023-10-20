import { ApiHandler, useFormData } from "sst/node/api";
import { Project } from "../../core/src/entities/projects";
import { getUser } from "./utils";

export const create = ApiHandler(async (_evt) => {
  const user = await getUser();
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const projectInput = Project.parse(Object.fromEntries(form.entries()));
  const result = await Project.create(user.id, projectInput);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const remove = ApiHandler(async (_evt) => {
  const user = await getUser();
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const projectId = form.get("id");
  if (!projectId) throw new Error("No project id");
  const result = await Project.remove(user.id, projectId);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const all = ApiHandler(async (_evt) => {
  const result = await Project.all();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});
