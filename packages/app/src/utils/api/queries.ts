import { Project } from "@oetzidev/core/entities/projects";
import { User } from "@oetzidev/core/entities/users";
import { Stack } from "@oetzidev/core/entities/stacks";
import { Technology } from "@oetzidev/core/entities/technologies";
import { Link } from "@oetzidev/core/entities/links";
import { z } from "zod";
import { SessionResult } from "../../../../functions/src/session";
import { ConstructIcons } from "../../components/ConstructsIcons";

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

export const projectsWithFilter = z.function(z.tuple([])).implement(async () =>
  fetch(
    `${API_BASE}/projects/all?${new URLSearchParams({
      visibility: "public",
    }).toString()}`
  ).then((res) => res.json() as Promise<NonNullable<Project.Frontend>[]>)
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

export const userStacks = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/user/stacks/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<NonNullable<User.Frontend>["stacks"]>)
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

export const calculateStackVersion = z.function(z.tuple([z.string(), z.string()])).implement(async (token, name) =>
  fetch(`${API_BASE}/stacks/calculate-version?name=${encodeURIComponent(name)}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((r) => r.json() as Promise<string>)
);

export const project = z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
  fetch(`${API_BASE}/user/projects/get?id=${encodeURIComponent(id)}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then(
    (res) =>
      res.json() as Promise<
        NonNullable<
          Project.Frontend & {
            constructs?: Array<{
              id: string;
              type: keyof typeof ConstructIcons;
              href: string;
              name: string;
            }>;
          }
        >
      >
  )
);

export const analyzeProject = z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
  fetch(`${API_BASE}/user/projects/analyze?id=${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then(
    (res) =>
      res.json() as Promise<
        NonNullable<
          Array<{
            id: string;
            type: keyof typeof ConstructIcons;
            name: string;
          }>
        >
      >
  )
);

export const links = z.function(z.tuple([z.string()])).implement(async (token) => {
  const res = await fetch(`${API_BASE}/links/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return res.json() as Promise<Link.Frontend[]>;
});
