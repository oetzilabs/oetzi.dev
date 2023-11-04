import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { migrate as mig } from "drizzle-orm/libsql/migrator";
import { join } from "path";
import { Config } from "sst/node/config";
import * as schema from "./schema";

const client = createClient({ url: Config.DATABASE_URL, authToken: Config.DATABASE_AUTH_TOKEN });

export const db = drizzle(client, {
  schema,
});

export const migrate = async () => {
  return mig(db, { migrationsFolder: join(__dirname, "packages/core/src/drizzle/migrations") });
};
