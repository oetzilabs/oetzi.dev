import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { StorageStack } from "./stacks/StorageStack";
import { DashboardSolidStartStack } from "./stacks/DashboardSolidStartStack";
import { DNSStack } from "./stacks/DNSStack";
import { PublicSolidStartStack } from "./stacks/PublicSolidStartStack";

export default {
  config(_input) {
    return {
      name: "oetzidev",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.setDefaultRemovalPolicy("destroy");
    app
      //
      .stack(DNSStack)
      .stack(StorageStack)
      .stack(ApiStack)
      .stack(DashboardSolidStartStack)
      .stack(PublicSolidStartStack);
  },
} satisfies SSTConfig;
