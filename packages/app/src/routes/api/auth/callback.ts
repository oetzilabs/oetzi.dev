import { APIEvent, redirect } from "solid-start";

export const GET = async (event: APIEvent) => {
  const url = new URL(event.request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    throw new Error("Code missing");
  }
  const response = await fetch(`${import.meta.env.VITE_AUTH_LOGIN_URL}/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "github",
      code,
      redirect_uri: `${url.origin}${url.pathname}`,
    }),
  }).then((r) => r.json());

  return redirect("/", {
    headers: {
      "Set-Cookie": `session=${response.access_token}; Path=/; Expires=${new Date(
        Date.now() + response.expires_in * 1000
      ).toUTCString()}; `,
    },
  });
};
