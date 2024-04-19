import { createHandler } from "@solidjs/start/entry";
import { StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en" classList={{ dark: true }}>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body class="bg-white dark:bg-black text-black dark:text-white">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
