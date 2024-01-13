import { redirect } from "@solidjs/router";
import { logout } from "../utils/api/session";

export const GET = async () => {
  await logout();

  return redirect("/");
};
