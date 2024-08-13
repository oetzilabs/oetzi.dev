import { Handler } from "aws-lambda";
import { json } from "./utils";

export const main: Handler = async (_evt) => {
  return json({ status: "ok" });
};
