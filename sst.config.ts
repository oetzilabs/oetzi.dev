import { SSTConfig } from "sst";
import { DNSStack } from "./stacks/DNSStack";
import { SolidStartStack } from "./stacks/PublicSolidStartStack";
import { SecretsStack } from "./stacks/SecretsStack";
import { StorageStack } from "./stacks/StorageStack";

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
      .stack(SecretsStack)
      .stack(StorageStack)
      // .stack(AuthStack)
      // .stack(ApiStack)
      // .stack(DashboardSolidStartStack)
      .stack(SolidStartStack);
  },
} satisfies SSTConfig;
