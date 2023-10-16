import { ApiHandler } from "sst/node/api";
import { getUser } from "./utils";
import { Stack } from "../../core/src/entities/stacks";

export const all = ApiHandler(async (_evt) => {
  const user = await getUser();
  if (!user) throw new Error("User not found");
  const stacks = await Stack.all();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stacks),
  };
});
