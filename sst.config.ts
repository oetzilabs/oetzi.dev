import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { StorageStack } from "./stacks/StorageStack";
import { SolidStartStack } from "./stacks/SolidStartStack";
import { DNSStack } from "./stacks/DNSStack";

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
      .stack(SolidStartStack);
  },
} satisfies SSTConfig;
