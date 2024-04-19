import { SolidStartSite, StackContext, use } from "sst/constructs";
// import { DatabaseStack } from "./DatabaseStack";
import { DNSStack } from "./DNSStack";
import { StorageStack } from "./StorageStack";

export function SolidStartStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  // const { db } = use(DatabaseStack);
  const storage = use(StorageStack);

  const publicSolidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [storage],
    path: "packages/app",
    buildCommand: "pnpm build",
    customDomain: {
      domainName: dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });

  stack.addOutputs({
    SiteUrl: publicSolidStartApp.customDomainUrl || "http://localhost:3000",
  });

  return publicSolidStartApp;
}
