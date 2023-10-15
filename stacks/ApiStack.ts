import { Api, Config, StackContext, use } from "sst/constructs";
import { Auth } from "sst/constructs/future";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";

export function ApiStack({ stack }: StackContext) {
  const dns = use(DNSStack);
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
      ],
      handler: "packages/functions/src/auth.handler",
    },
    customDomain: {
      domainName: "auth." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });

  const api = new Api(stack, "api", {
    customDomain: {
      domainName: "api." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
    defaults: {
      function: {
        nodejs: {
          install: ["@libsql/linux-x64-gnu", "@libsql/client"],
          // esbuild: { external: ["@libsql/linux-x64-gnu"] },
        },
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
      "GET /user/organizations/all": {
        function: {
          handler: "packages/functions/src/user.allOrganizations",
          description: "This is the all user organizations function",
        },
      },
      "GET /user/projects/all": {
        function: {
          handler: "packages/functions/src/user.allProjects",
          description: "This is the all user projects function",
        },
      },
      "POST /user/projects/create": {
        function: {
          handler: "packages/functions/src/projects.create",
          description: "This is the create project function",
        },
      },
      "GET /user/projects/is-available": {
        function: {
          handler: "packages/functions/src/user.projectIsAvailable",
          description: "This is the is available function",
        },
      },
      "POST /user/projects/sync": {
        function: {
          handler: "packages/functions/src/user.syncProjects",
          description: "This is the sync projects function",
        },
      },
      "GET /user/projects/participated": {
        function: {
          handler: "packages/functions/src/user.participatedProjects",
          description: "This is the participated projects function",
        },
      },
      "GET /projects/all": {
        function: {
          handler: "packages/functions/src/projects.all",
          description: "This is the all projects function",
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
    ApiEndpoint: api.customDomainUrl || api.url,
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
