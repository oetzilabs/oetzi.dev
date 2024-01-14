import { Project } from "@oetzidev/core/entities/projects";
import { User } from "@oetzidev/core/entities/users";
import { z } from "zod";
import { Blog } from "../../../../core/src/entities/blogs";
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
  .implement(async () => fetch(`${API_BASE}/projects/all`).then((res) => res.json() as Promise<Project.Frontend[]>));

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

export const userProjects = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/user/projects/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<User.Frontend["projects"]>)
);

export const userBlogs = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/user/blogs/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<User.Frontend["projects"]>)
);

export const project = z.function(z.tuple([z.string(), z.string()])).implement(async (token, id) =>
  fetch(`${API_BASE}/user/projects/get?id=${encodeURIComponent(id)}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<Project.Frontend>)
);

export const blog = z
  .function(z.tuple([z.string()]))
  .implement(async (id) =>
    fetch(`${API_BASE}/user/blogs/get?id=${encodeURIComponent(id)}`).then((res) => res.json() as Promise<Blog.Frontend>)
  );
