import { SSTConfig } from "sst";
import { DNSStack } from "./stacks/DNSStack";
import { SolidStartStack } from "./stacks/PublicSolidStartStack";
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
      .stack(StorageStack)
      .stack(SolidStartStack);
  },
} satisfies SSTConfig;
