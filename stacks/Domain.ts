export const domain = "oetzi.dev" as const;

export const subdomain = "" as const;

export const stagedomain = !$dev ? `${subdomain}` : `${$app.stage}.dev.${subdomain}`;

export const cloudflare = sst.cloudflare.dns({
  zone: "6f659090c4a868d00656d51dbb55facf",
  override: true,
});
