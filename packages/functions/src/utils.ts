import { sessions } from "./auth";
import { User } from "@oetzidev/core/entities/users";

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
