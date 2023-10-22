import * as Project from "@oetzidev/core/entities/projects";
import { Stack } from "@oetzidev/core/entities/stacks";
import { Technology } from "@oetzidev/core/entities/technologies";
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
        org: z.string(),
      }),
    ])
  )
  .implement(async (token, input) =>
    fetch(`${API_BASE}/user/projects/create`, {
      method: "POST",
      body: new URLSearchParams(input),
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json() as Promise<Project.Frontend>)
  );

export const removeProject = z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
  fetch(`${API_BASE}/user/projects/remove`, {
    method: "POST",
    body: new URLSearchParams({ id }),
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

export const syncProject = z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
  fetch(`${API_BASE}/user/project/sync?id=${encodeURIComponent(id)}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((r) => r.json() as Promise<NonNullable<any>>)
);

export const createStack = z
  .function(
    z.tuple([
      z.string(),
      z.object({
        version: z.string(),
        name: z.string(),
        description: z.string().optional(),
        s3Key: z.string(),
        hidden: z
          .boolean()
          .optional()
          .default(false)
          .transform((v) => (v ? "true" : "false")),
        protected: z.string().optional(),
      }),
    ])
  )
  .implement(async (token, input) =>
    fetch(`${API_BASE}/user/stack/create`, {
      method: "POST",
      body: new URLSearchParams(input),
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json() as Promise<Project.Frontend>)
  );

export const checkStackFromUrl = z.function(z.tuple([z.string(), z.string().url()])).implement(async (token, url) =>
  fetch(`${API_BASE}/stacks/check-url`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: new URLSearchParams({ url }),
  }).then((r) => r.json() as Promise<Array<Technology.Frontend> | { error: any }>)
);

export const checkStackFromFile = z.function(z.tuple([z.string(), z.string()])).implement(async (token, filecontent) =>
  fetch(`${API_BASE}/stacks/check-file`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: new URLSearchParams({ file: filecontent }),
  }).then((r) => r.json() as Promise<Array<Technology.Frontend> | { error: any }>)
);
