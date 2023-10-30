import { Api, Config, SolidStartSite, StackContext, use } from "sst/constructs";
import { Auth } from "sst/constructs/future";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { SolidStartStack } from "./SolidStartStack";

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
      "GET /user/projects/get": {
        function: {
          handler: "packages/functions/src/user.getProject",
          description: "This is the get user project function",
        },
      },
      // "GET /user/projects/analyze": {
      //   function: {
      //     handler: "packages/functions/src/projects.analyze",
      //     description: "This is the analyze project function",
      //   },
      // },
      "POST /user/projects/create": {
        function: {
          handler: "packages/functions/src/projects.create",
          description: "This is the create project function",
        },
      },
      "POST /user/projects/remove": {
        function: {
          handler: "packages/functions/src/projects.remove",
          description: "This is the remove project function",
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
      "POST /user/project/sync": {
        function: {
          handler: "packages/functions/src/projects.syncById",
          description: "This is the sync project function",
        },
      },
      "GET /user/projects/participated": {
        function: {
          handler: "packages/functions/src/user.participatedProjects",
          description: "This is the participated projects function",
        },
      },
      "GET /user/stacks/all": {
        function: {
          handler: "packages/functions/src/user.allUserStacks",
          description: "This is the all stacks of the user function",
        },
      },
      "POST /user/stacks/create": {
        function: {
          handler: "packages/functions/src/user.createStack",
          description: "This is the create user-stacks function",
        },
      },
      "GET /projects/all": {
        function: {
          handler: "packages/functions/src/projects.all",
          description: "This is the all projects function",
        },
      },
      "GET /stacks/all": {
        function: {
          handler: "packages/functions/src/stacks.all",
          description: "This is the all stacks function",
        },
      },
      "POST /stacks/check-url": {
        function: {
          handler: "packages/functions/src/stacks.checkUrl",
          description: "This is the checkUrl stacks function",
        },
      },
      "POST /stacks/check-file": {
        function: {
          handler: "packages/functions/src/stacks.checkFile",
          description: "This is the checkFile stacks function",
        },
      },
      "GET /stacks/calculate-version": {
        function: {
          handler: "packages/functions/src/stacks.calculateVersion",
          description: "This is the calculateVersion stacks function",
        },
      },
      "GET /technologies/all": {
        function: {
          handler: "packages/functions/src/technologies.all",
          description: "This is the all technologies function",
        },
      },
      "GET /links/all": {
        function: {
          handler: "packages/functions/src/links.all",
          description: "This is the all link handler function",
        },
      },
      "GET /link/get": {
        function: {
          handler: "packages/functions/src/links.get",
          description: "This is the get link handler function",
        },
      },
      "POST /links/create": {
        function: {
          handler: "packages/functions/src/links.create",
          description: "This is the create link handler function",
        },
      },
      "PUT /links/update": {
        function: {
          handler: "packages/functions/src/links.update",
          description: "This is the update link handler function",
        },
      },
      "DELETE /links/remove": {
        function: {
          handler: "packages/functions/src/links.remove",
          description: "This is the remove link handler function",
        },
      },
      "GET /link/{element}": {
        function: {
          handler: "packages/functions/src/links.handler",
          description: "This is the link handler function",
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
