import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";

export function SolidStartStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const { api, auth } = use(ApiStack);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);

  const CallbackUrlBase = dns.domain.includes("dev") ? "http://localhost:3000" : `https://${dns.domain}`;
  const publicSolidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api, auth],
    path: "packages/app",
    buildCommand: "pnpm build",
    environment: {
      SESSION_SECRET: "HW3YcVVCsHelHNMUccHOeph+/pe7Ornf+fPFbH0PUL8=",
      VITE_API_URL: api.customDomainUrl || api.url,
      VITE_AUTH_URL:
        auth.url +
        `/authorize?provider=github&response_type=code&client_id=github&redirect_uri=${CallbackUrlBase}/api/auth/callback`,
      VITE_AUTH_LOGIN_URL: auth.url,
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
