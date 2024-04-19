import { ApiHandler } from "sst/node/api";
import { json } from "./utils";

export const main = ApiHandler(async (_evt) => {
  return json({ status: "ok" });
});
