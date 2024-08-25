import { cf, domain } from "./Domain";

export const api = new sst.aws.ApiGatewayV2(`Api`, {
  domain: {
    name: `api.${domain}`,
    dns: cf,
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
