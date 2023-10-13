import { User } from "@oetzidev/core/entities/users";
import dayjs from "dayjs";
import { z } from "zod";
import { SessionResult } from "../../../../functions/src/session";

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
