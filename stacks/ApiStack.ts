import { Api, Config, StackContext, use } from "sst/constructs";
import { DNSStack } from "./DNSStack";
import { StorageStack } from "./StorageStack";
export function ApiStack({ stack }: StackContext) {
  const dns = use(DNSStack);
  const storage = use(StorageStack);

  const api = new Api(stack, "api", {
    customDomain: {
      domainName: "api." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
    defaults: {
      function: {
        bind: [storage],
      },
    },
    routes: {
      "GET /healthcheck": {
        function: {
          handler: "packages/functions/src/healthcheck.main",
          description: "This is the healthcheck function",
        },
      },
    },
    cors: {
      allowOrigins: ["*", "http://localhost:3000"],
    },
  });

  new Config.Parameter(stack, "APP_URL", {
    value: api.url,
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
  });

  return api;
}
