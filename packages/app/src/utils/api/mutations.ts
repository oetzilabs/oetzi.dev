import { type Project } from "@oetzidev/core/entities/projects";
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

export const ProjectsUpdateZod = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  remote: z.string().optional(),
  visibility: z.enum(["public", "private"]),
});

export const Projects = {
  create: z.function(z.tuple([z.string(), ProjectsCreateZod])).implement((token, project) => {
    return fetch(`${API_BASE}/projects/create`, {
      method: "POST",
      body: new URLSearchParams(project),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
  remove: z.function(z.tuple([z.string(), z.string().uuid()])).implement((token, id) => {
    return fetch(`${API_BASE}/projects/remove`, {
      method: "POST",
      body: new URLSearchParams({ id }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
  update: z.function(z.tuple([z.string(), ProjectsUpdateZod])).implement((token, project) => {
    return fetch(`${API_BASE}/projects/update`, {
      method: "POST",
      body: new URLSearchParams(project),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
};

export const BlogsCreateZod = z.object({
  title: z.string(),
  content: z.string(),
  visibility: z.enum(["public", "private"]),
});

export const BlogsRemoveZod = z.object({
  id: z.string(),
});

export const BlogsUpdateZod = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

export const Blogs = {
  create: z.function(z.tuple([z.string(), BlogsCreateZod])).implement((token, blog) => {
    return fetch(`${API_BASE}/blogs/create`, {
      method: "POST",
      body: new URLSearchParams(blog),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
  remove: z.function(z.tuple([z.string(), z.string().uuid()])).implement((token, id) => {
    return fetch(`${API_BASE}/blogs/remove`, {
      method: "POST",
      body: new URLSearchParams({ id }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
  update: z.function(z.tuple([z.string(), BlogsUpdateZod])).implement((token, blog) => {
    return fetch(`${API_BASE}/blogs/update`, {
      method: "POST",
      body: new URLSearchParams(blog),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
};

export const TechnologiesCreateZod = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const TechnologiesRemoveZod = z.object({
  id: z.string(),
});

export const TechnologiesUpdateZod = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const Technologies = {
  create: z.function(z.tuple([z.string(), TechnologiesCreateZod])).implement((token, technology) => {
    return fetch(`${API_BASE}/technologies/create`, {
      method: "POST",
      body: new URLSearchParams(technology),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
  remove: z.function(z.tuple([z.string(), z.string().uuid()])).implement((token, id) => {
    return fetch(`${API_BASE}/technologies/remove`, {
      method: "POST",
      body: new URLSearchParams({ id }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
  update: z.function(z.tuple([z.string(), TechnologiesUpdateZod])).implement((token, technology) => {
    return fetch(`${API_BASE}/technologies/update`, {
      method: "POST",
      body: new URLSearchParams(technology),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<Project>);
  }),
};
