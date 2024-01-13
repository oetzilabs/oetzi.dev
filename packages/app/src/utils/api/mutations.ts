import { Project } from "@oetzidev/core/entities/projects";
import { z } from "zod";

export * as Mutations from "./mutations";

const API_BASE = import.meta.env.VITE_API_URL;

export const ProjectsCreateZod = z.object({
  name: z.string(),
  description: z.string().optional(),
  remote: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

export const ProjectsRemoveZod = z.object({
  id: z.string(),
});

export const Projects = {
  create: z.function(z.tuple([z.string(), ProjectsCreateZod])).implement((token, project) => {
    return fetch(`${API_BASE}/user/projects/create`, {
      method: "POST",
      body: new URLSearchParams(project),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
  remove: z.function(z.tuple([z.string(), z.string().uuid()])).implement((token, id) => {
    return fetch(`${API_BASE}/user/projects/remove`, {
      method: "POST",
      body: new URLSearchParams({ id }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
};
