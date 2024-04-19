import { StackContext, use } from "sst/constructs";
import { Auth } from "sst/constructs/future";
import { DNSStack } from "./DNSStack";
import { SecretsStack } from "./SecretsStack";
import { StorageStack } from "./StorageStack";

export function AuthStack({ stack }: StackContext) {
  const secrets = use(SecretsStack);
  const dns = use(DNSStack);
  const storage = use(StorageStack);
  const auth = new Auth(stack, "auth", {
    authenticator: {
      nodejs: {
        install: ["@libsql/linux-x64-gnu", "@libsql/client"],
        // esbuild: { external: ["@libsql/linux-x64-gnu"] },
      },
      bind: [
        secrets.GITHUB_CLIENT_ID,
        secrets.GITHUB_CLIENT_SECRET,
        secrets.GITHUB_APP_CLIENT_ID,
        secrets.GITHUB_APP_CLIENT_SECRET,
        secrets.DATABASE_URL,
        secrets.DATABASE_AUTH_TOKEN,
        storage,
      ],
      handler: "packages/functions/src/auth.handler",
    },
    customDomain: {
      domainName: "auth." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });
  return auth;
}
