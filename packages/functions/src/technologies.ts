import { ApiHandler, useFormData } from "sst/node/api";
import { error, getUser, json } from "./utils";
import { Technology } from "../../core/src/entities/technologies";

export const all = ApiHandler(async (_evt) => {
  const technologies = await Technology.all();
  return json(technologies);
});

export const create = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  if (!user) return error("Not logged in");
  const form = useFormData();
  if (!form) return error("No form data");
  const d = Object.fromEntries(form.entries());
  const projectInput = Technology.safeParse(d);
  if (!projectInput.success) {
    console.log(d, projectInput.error.flatten().fieldErrors);
    return error("Invalid data");
  }

  const result = await Technology.create(projectInput.data);

  return json(result);
});
