/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "oetzidev",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
        cloudflare: {
          version: "5.24.1",
        },
      },
    };
  },
  async run() {
    const solidStart = await import("./stacks/SolidStart");
    const api = await import("./stacks/Api");

    return {
      solidStartUrl: $dev ? "http://localhost:3000" : solidStart.solidStartApp.url,
      apiUrl: api.api.url,
    };
  },
});
