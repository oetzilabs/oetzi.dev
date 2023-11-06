import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";

export function PublicSolidStartStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const { api, auth } = use(ApiStack);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);

  const publicSolidStartApp = new SolidStartSite(stack, `${app.name}-public-app`, {
    bind: [bucket, api, auth],
    path: "packages/app",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
      VITE_S3_BUCKET: bucket.bucketName,
    },
    customDomain: {
      domainName: dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });

  stack.addOutputs({
    SiteUrl: publicSolidStartApp.customDomainUrl || "http://localhost:3000",
  });

  return {
    publicSolidStartApp: publicSolidStartApp,
  };
}