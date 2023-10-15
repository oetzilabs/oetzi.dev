import * as Project from "@oetzidev/core/entities/projects";
import { z } from "zod";

export * as Mutations from "./mutations";

const API_BASE = import.meta.env.VITE_API_URL;

export const createProject = z
  .function(
    z.tuple([
      z.string(),
      z.object({
        name: z.string(),
        description: z.string().optional(),
        protected: z.string().optional(),
        visibility: z.union([z.literal("public"), z.literal("private")]).optional(),
        organization: z.string(),
      }),
    ])
  )
  .implement(async (token, input) =>
    fetch(`${API_BASE}/projects/create`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json() as Promise<Project.Frontend>)
  );

export const syncProjects = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/user/projects/sync`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((r) => r.json() as Promise<NonNullable<Project.Frontend>[]>)
);
