import { domain } from "./domain";

new sst.cloudflare.x.SolidStart("MySolidStart", {
  path: "packages/web",
  domain,
  environment: {
    SST_STAGE: $app.stage,
  }
});
