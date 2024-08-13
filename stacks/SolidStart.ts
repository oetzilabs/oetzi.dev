import { cloudflare, domain, stagedomain, subdomain } from "./Domain";

const main_app_url = $dev ? "http://localhost:3000" : `https://${stagedomain}${domain}`;

export const solidStartApp = new sst.aws.SolidStart(`SolidStartApp`, {
  path: "packages/web",
  buildCommand: "pnpm build",
  domain: {
    name: `${stagedomain}${domain}`,
    dns: cloudflare,
  },
  invalidation: {
    paths: "all",
    wait: true,
  },
});
