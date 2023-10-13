import { Api, Config, StackContext, use } from "sst/constructs";
import { Auth } from "sst/constructs/future";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const secrets = Config.Secret.create(
    stack,
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_APP_CLIENT_ID",
    "GITHUB_APP_CLIENT_SECRET",
    "DATABASE_URL",
    "DATABASE_AUTH_TOKEN"
  );

  const { bucket } = use(StorageStack);

  const auth = new Auth(stack, "auth", {
    authenticator: {
      bind: [
        secrets.GITHUB_CLIENT_ID,
        secrets.GITHUB_CLIENT_SECRET,
        secrets.GITHUB_APP_CLIENT_ID,
        secrets.GITHUB_APP_CLIENT_SECRET,
        secrets.DATABASE_URL,
        secrets.DATABASE_AUTH_TOKEN,
      ],
      handler: "packages/functions/src/auth.handler",
    },
    customDomain: {
      domainName: "auth.oetzi.dev",
      hostedZone: "oetzi.dev",
    },
  });

  const api = new Api(stack, "api", {
    customDomain: {
      domainName: "api.oetzi.dev",
      hostedZone: "oetzi.dev",
    },
    defaults: {
      function: {
        // handler: "packages/functions/src/migrator.handler",
        bind: [
          secrets.GITHUB_CLIENT_ID,
          secrets.GITHUB_CLIENT_SECRET,
          secrets.GITHUB_APP_CLIENT_ID,
          secrets.GITHUB_APP_CLIENT_SECRET,
          auth,
          secrets.DATABASE_URL,
          secrets.DATABASE_AUTH_TOKEN,
          bucket,
        ],
        copyFiles: [
          {
            from: "packages/core/src/drizzle",
            to: "drizzle",
          },
          {
            from: "node_modules/@sparticuz/chromium/bin",
            to: "packages/functions/bin",
          },
        ],
      },
    },
    routes: {
      "GET /healthcheck": {
        function: {
          handler: "packages/functions/src/healthcheck.main",
          description: "This is the healthcheck function",
        },
      },
      "GET /session": {
        function: {
          handler: "packages/functions/src/session.handler",
          description: "This is the session function",
        },
      },
      "GET /open": {
        function: {
          handler: "packages/functions/src/open.handler",
          description:
            "This is the function to view all visible data about the application, since this will be an OpenSource Application at some point",
        },
      },
      "POST /migrate": {
        function: {
          handler: "packages/functions/src/migrator.handler",
          description: "This is the migrator function",
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

  new Config.Parameter(stack, "AUTH_URL", {
    value: auth.url,
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    AuthEndpoint: auth.url,
  });

  return {
    api,
    auth,
    GITHUB_CLIENT_ID: secrets.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: secrets.GITHUB_CLIENT_SECRET,
    GITHUB_APP_CLIENT_ID: secrets.GITHUB_APP_CLIENT_ID,
    GITHUB_APP_CLIENT_SECRET: secrets.GITHUB_APP_CLIENT_SECRET,
  };
}
