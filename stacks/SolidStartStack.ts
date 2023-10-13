import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";

export function SolidStartStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const { api, auth, GITHUB_CLIENT_ID, GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET, GITHUB_CLIENT_SECRET } =
    use(ApiStack);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);

  const solidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, auth, GITHUB_CLIENT_ID, GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET, GITHUB_CLIENT_SECRET],
    path: "packages/app",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
      VITE_S3_BUCKET: bucket.bucketName,
      VITE_AUTH_URL: auth.url,
    },
    customDomain: {
      domainName: dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });

  stack.addOutputs({
    SiteUrl: solidStartApp.customDomainUrl || "http://localhost:3000",
  });

  return {
    solidStartApp,
  };
}
