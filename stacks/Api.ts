import { cloudflare, domain, stagedomain, subdomain } from "./Domain";

export const api = new sst.aws.ApiGatewayV2(`Api`, {
  domain: {
    name: `api.${stagedomain}${domain}`,
    dns: cloudflare,
  },
  cors: {
    allowOrigins: ["*", "http://localhost:3000"],
  },
});

api.route("GET /healthcheck", {
  handler: "packages/functions/src/healthcheck.main",
  description: "This is the healthcheck function",
  // copyFiles,
  // link,
});
