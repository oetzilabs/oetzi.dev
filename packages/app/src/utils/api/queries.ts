import { Project } from "@oetzidev/core/entities/projects";
import { User } from "@oetzidev/core/entities/users";
import { Stack } from "@oetzidev/core/entities/stacks";
import { Technology } from "@oetzidev/core/entities/technologies";
import { z } from "zod";
import { SessionResult } from "../../../../functions/src/session";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL;

export const session = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/session`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<SessionResult>)
);

export const projects = z
  .function(z.tuple([]))
  .implement(async () =>
    fetch(`${API_BASE}/projects/all`).then((res) => res.json() as Promise<NonNullable<Project.Frontend>[]>)
  );

export const userProjects = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/user/projects/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<NonNullable<User.Frontend>["projects"]>)
);

export const isAvailableRepositoryName = z
  .function(z.tuple([z.string(), z.string(), z.string()]))
  .implement(async (token, name, org) =>
    fetch(
      `${API_BASE}/user/projects/is-available?name=${encodeURIComponent(name)}&organization=${encodeURIComponent(org)}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    ).then((res) => res.json() as Promise<boolean>)
  );

export const organizations = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/user/organizations/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then(
    (res) =>
      res.json() as Promise<
        Record<
          string,
          {
            name: string;
            repos: Array<{
              name: string;
              type: "public" | "private";
              isTemplate: boolean;
            }>;
          }
        >
      >
  )
);

export const userTemplates = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/user/templates/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<NonNullable<User.Frontend>["templates"]>)
);

export const stacks = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/stacks/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<NonNullable<Stack.Frontend>[]>)
);

export const technologies = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/technologies/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<NonNullable<Technology.Frontend>[]>)
);
