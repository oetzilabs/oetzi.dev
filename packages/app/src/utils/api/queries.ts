import { User } from "@oetzidev/core/entities/users";
import dayjs from "dayjs";
import { z } from "zod";
import { SessionResult } from "../../../../functions/src/session";
import { Project } from "@oetzidev/core/entities/projects";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL;

export const sessionZod = z.function(z.tuple([z.string()]));

export const session = sessionZod.implement(async (token) =>
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
