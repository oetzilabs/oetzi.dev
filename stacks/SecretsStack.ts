import { Config, StackContext } from "sst/constructs";

export function SecretsStack({ stack }: StackContext) {
  const secrets = Config.Secret.create(
    stack,
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_APP_CLIENT_ID",
    "GITHUB_APP_CLIENT_SECRET",
    "DATABASE_URL",
    "DATABASE_AUTH_TOKEN"
  );

  return secrets;
}
