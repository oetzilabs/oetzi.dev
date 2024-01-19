import { sessions } from "./auth";
import { User } from "@oetzidev/core/entities/users";
import { StatusCodes } from "http-status-codes";
import { useHeader } from "sst/node/api";

export const getUser = async () => {
  const s = sessions.use();
  if (!s) throw new Error("No session");
  if (s.type !== "user") throw new Error("Session is not a user session");

  const userid = s.properties.id;
  const user = await User.findById(userid);
  if (!user) {
    throw new Error("User not found");
  }
  return [user, s.properties.expiresAt] as const;
};

export const json = (body: unknown, status: StatusCodes = StatusCodes.OK) => {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};

export const text = (body: string, status: StatusCodes = StatusCodes.OK) => {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "text/plain",
    },
    body,
  };
};

export const error = (body: unknown, status: StatusCodes = StatusCodes.BAD_REQUEST) => {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify(body),
  };
};
