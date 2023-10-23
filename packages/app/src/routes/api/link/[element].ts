import { ApiHandler } from "solid-start/api/types";

const linkMap = {
  constructs: {
    auth: "https://docs.sst.dev/constructs/Auth",
    solidstartsite: "https://docs.sst.dev/constructs/SolidStartSite",
    api: "https://docs.sst.dev/constructs/Api",
    config: "https://docs.sst.dev/constructs/Secret",
  },
} as const;

export const GET: ApiHandler = (event) => {
  const { element } = event.params;
  if (element === "login") {
    return Response.redirect(`${new URL(event.request.url).origin}/`, 302);
  }
  const sp = new URLSearchParams(event.request.url.split("?")[1]);
  const type = sp.get("type");
  if (!type)
    return new Response(
      JSON.stringify({
        error: "No type defined in QueryParams",
      }),
      {
        status: 404,
        statusText: "No type defined in QueryParams",
      }
    );
  if (element in linkMap && type in linkMap[element as keyof typeof linkMap]) {
    const branch = linkMap[element as keyof typeof linkMap];
    const link = branch[type as keyof typeof branch];
    return Response.redirect(`${link}?=${new URLSearchParams({ ref: "oetzi.dev" })}`, 302);
  }

  return new Response(
    JSON.stringify({
      error: "There is nothing linked to the request you have asked for.",
    }),
    {
      status: 400,
      statusText: "There is nothing linked to the request you have asked for.",
    }
  );
};
