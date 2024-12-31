import { cf, domain } from "./Domain";

export const solidStartApp = new sst.aws.SolidStart(`NewSolidStartApp`, {
  path: "packages/web",
  domain: {
    name: domain,
    dns: cf,
  },
  invalidation: {
    paths: "all",
    wait: true,
  },
});
