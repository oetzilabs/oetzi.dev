export const domain =
  {
    production: "oetzi.dev",
    dev: "dev.oetzi.dev",
  }[$app.stage] || $app.stage + ".dev.oetzi.dev";

export const zone = cloudflare.getZoneOutput({
  name: "oetzi.dev",
});

export const cf = sst.cloudflare.dns({
  zone: zone.zoneId,
});
