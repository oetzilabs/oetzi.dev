import { cf, domain } from "./Domain";

const main_app_url = $dev ? "http://localhost:3000" : `https://${domain}`;

export const solidStartApp = new sst.aws.SolidStart(`SolidStartApp`, {
  path: "packages/web",
  buildCommand: "pnpm build",
  domain: {
    name: domain,
    dns: cf,
  },
  invalidation: {
    paths: "all",
    wait: true,
  },
});
