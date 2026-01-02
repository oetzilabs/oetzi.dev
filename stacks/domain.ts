export const domain = (() => {
  if ($app.stage === "main") return "oetzi.dev"
  if ($app.stage === "dev") return "dev.oetzi.dev"
  return `${$app.stage}.dev.oetzi.dev`
})()

export const zoneID = "6f659090c4a868d00656d51dbb55facf"
