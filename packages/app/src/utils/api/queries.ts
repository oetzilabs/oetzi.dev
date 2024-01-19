import { type Project } from "@oetzidev/core/entities/projects";
import { z } from "zod";
import { Blog } from "../../../../core/src/entities/blogs";
import { type SessionResult } from "../../../../functions/src/session";
import { type Technology } from "../../../../core/src/entities/technologies";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL;

export const session = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/session`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<SessionResult>)
);

export const projects = z
  .function(z.tuple([]))
  .implement(async () => fetch(`${API_BASE}/projects/all`).then((res) => res.json() as Promise<Project.Frontend[]>));

export const technologies = z
  .function(z.tuple([]))
  .implement(async () =>
    fetch(`${API_BASE}/technologies/all`).then((res) => res.json() as Promise<Technology.Frontend[]>)
  );

export const blogs = z
  .function(z.tuple([]))
  .implement(async () => fetch(`${API_BASE}/blogs/all`).then((res) => res.json() as Promise<Blog.Frontend[]>));

export const projectsWithFilter = z.function(z.tuple([])).implement(async () =>
  fetch(
    `${API_BASE}/projects/all?${new URLSearchParams({
      visibility: "public",
    }).toString()}`
  ).then((res) => res.json() as Promise<Project.Frontend[]>)
);

export const blogsWithFilter = z.function(z.tuple([])).implement(async () =>
  fetch(
    `${API_BASE}/blogs/all?${new URLSearchParams({
      visibility: "public",
    }).toString()}`
  ).then((res) => res.json() as Promise<Blog.Frontend[]>)
);

export const project = z
  .function(z.tuple([z.string()]))
  .implement(async (id) =>
    fetch(`${API_BASE}/projects/get?id=${encodeURIComponent(id)}`).then(
      (res) => res.json() as Promise<Project.Frontend>
    )
  );

export const blog = z
  .function(z.tuple([z.string()]))
  .implement(async (id) =>
    fetch(`${API_BASE}/blogs/get?id=${encodeURIComponent(id)}`).then((res) => res.json() as Promise<Blog.Frontend>)
  );
