import { Project } from "@oetzidev/core/entities/projects";
import { User } from "@oetzidev/core/entities/users";
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
            analysis: {
              constructs?: Record<
                string,
                | {
                    id: string;
                    type: keyof typeof ConstructIcons;
                    href: string;
                    name: string;
                    meta: {
                      line: number;
                      code: string[];
                      file: string;
                      import: string;
                    };
                  }
                | false
              >;
            };
          }
        >
      >
  )
);

