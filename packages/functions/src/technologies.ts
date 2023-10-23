import { ApiHandler } from "sst/node/api";
import { getUser } from "./utils";
import { Technology } from "../../core/src/entities/technologies";

export const all = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  if (!user) throw new Error("User not found");
  const technologies = await Technology.all();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(technologies),
  };
});
