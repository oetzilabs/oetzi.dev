import { Project } from "@oetzidev/core/entities/projects";
import { ApiHandler } from "sst/node/api";
import { getUser } from "./utils";

export const allProjects = ApiHandler(async (_evt) => {
  const user = await getUser();
  const result = await Project.allByUser(user.id);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const participatedProjects = ApiHandler(async (_evt) => {
  const user = await getUser();
  const result = await Project.allByUser(user.id);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const syncProjects = ApiHandler(async (_evt) => {
  const user = await getUser();
  const result = await Project.allByUser(user.id);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});
