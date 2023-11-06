import * as Project from "@oetzidev/core/entities/projects";
import { Stack } from "@oetzidev/core/entities/stacks";
import { Technology } from "@oetzidev/core/entities/technologies";
import { z } from "zod";
import { Link } from "../../../../core/src/entities/links";

export * as Mutations from "./mutations";

const API_BASE = import.meta.env.VITE_API_URL;

export const Stacks = {
  checkFromFile: z.function(z.tuple([z.string(), z.string()])).implement(async (token, filecontent) =>
    fetch(`${API_BASE}/stacks/check-file`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: new URLSearchParams({ file: filecontent }),
    }).then((r) => r.json() as Promise<Array<Technology.Frontend> | { error: any }>)
  ),
  checkFromUrl: z.function(z.tuple([z.string(), z.string().url()])).implement(async (token, url) =>
    fetch(`${API_BASE}/stacks/check-url`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: new URLSearchParams({ url }),
    }).then((r) => r.json() as Promise<Array<Technology.Frontend> | { error: any }>)
  ),
  create: z
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
      }).then((r) => r.json() as Promise<Stack.Frontend>)
    ),
  remove: z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
    fetch(`${API_BASE}/user/stack/remove`, {
      method: "POST",
      body: new URLSearchParams({ id }),
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json() as Promise<Stack.Frontend>)
  ),
  update: z
    .function(
      z.tuple([
        z.string(),
        z.object({
          id: z.string(),
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
      fetch(`${API_BASE}/user/stack/update`, {
        method: "POST",
        body: new URLSearchParams(input),
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json() as Promise<Stack.Frontend>)
    ),
} as const;

export const Projects = {
  create: z
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
    ),
  remove: z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
    fetch(`${API_BASE}/user/projects/remove`, {
      method: "POST",
      body: new URLSearchParams({ id }),
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json() as Promise<Project.Frontend>)
  ),
  update: z
    .function(
      z.tuple([
        z.string(),
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          protected: z.string().optional(),
          visibility: z.union([z.literal("public"), z.literal("private")]).optional(),
        }),
      ])
    )
    .implement(async (token, input) =>
      fetch(`${API_BASE}/user/project/update`, {
        method: "POST",
        body: new URLSearchParams(input),
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json() as Promise<Project.Frontend>)
    ),
  sync: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/user/projects/sync`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json() as Promise<NonNullable<Project.Frontend>[]>)
  ),
  syncOne: z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
    fetch(`${API_BASE}/user/project/sync?id=${encodeURIComponent(id)}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json() as Promise<NonNullable<any>>)
  ),
} as const;

export const Links = {
  create: z
    .function(
      z.tuple([
        z.string(),
        z.object({
          group: z.string(),
          type: z.string(),
          url: z.string().url(),
          protected: z.string().optional().default(""),
        }),
      ])
    )
    .implement(async (token, input) =>
      fetch(`${API_BASE}/links/create`, {
        method: "POST",
        body: new URLSearchParams(input),
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json() as Promise<NonNullable<Link.Frontend>>)
    ),
  remove: z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
    fetch(`${API_BASE}/links/remove`, {
      method: "DELETE",
      body: new URLSearchParams({ id }),
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((r) => r.json() as Promise<NonNullable<Link.Frontend>>)
  ),
  update: z
    .function(
      z.tuple([
        z.string(),
        z
          .object({
            id: z.string(),
            group: z.string(),
            type: z.string(),
            url: z.string().url(),
            active: z.boolean(),
            protected: z.string().optional().default(""),
          })
          .partial(),
      ])
    )
    .implement(async (token, input) =>
      fetch(`${API_BASE}/links/update`, {
        method: "PUT",
        body: new URLSearchParams({ ...input, active: input.active ? "true" : "false" }),
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((r) => r.json() as Promise<NonNullable<Link.Frontend>>)
    ),
} as const;
