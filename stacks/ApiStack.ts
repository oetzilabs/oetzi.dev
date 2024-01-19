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
      "GET /projects/all": {
        function: {
          handler: "packages/functions/src/projects.all",
          description: "This is the all projects function",
        },
      },
      "POST /projects/create": {
        function: {
          handler: "packages/functions/src/projects.create",
          description: "This is the create project function",
        },
      },
      "GET /projects/get": {
        function: {
          handler: "packages/functions/src/projects.get",
          description: "This is the get projects function",
        },
      },
      "POST /projects/remove": {
        function: {
          handler: "packages/functions/src/projects.remove",
          description: "This is the remove project function",
        },
      },
      "GET /blogs/all": {
        function: {
          handler: "packages/functions/src/blogs.all",
          description: "This is the all blogs function",
        },
      },
      "GET /blogs/get": {
        function: {
          handler: "packages/functions/src/blogs.getBlog",
          description: "This is the get user blog function",
        },
      },
      "POST /blogs/create": {
        function: {
          handler: "packages/functions/src/blogs.create",
          description: "This is the create blog function",
        },
      },
      "POST /blogs/remove": {
        function: {
          handler: "packages/functions/src/blogs.remove",
          description: "This is the remove blog function",
        },
      },
      "POST /blogs/update": {
        function: {
          handler: "packages/functions/src/blogs.update",
          description: "This is the update blog function",
        },
      },
      "GET /technologies/all": {
        function: {
          handler: "packages/functions/src/technologies.all",
          description: "This is the all technologies function",
        },
      },
      "POST /technologies/create": {
        function: {
          handler: "packages/functions/src/technologies.create",
          description: "This is the create technologies function",
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
    DATABASE_URL: secrets.DATABASE_URL,
    DATABASE_AUTH_TOKEN: secrets.DATABASE_AUTH_TOKEN,
  };
}
