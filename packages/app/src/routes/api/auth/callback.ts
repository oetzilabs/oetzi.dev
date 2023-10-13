import { APIEvent, json, redirect, serializeCookie } from "solid-start";
import fetch from "node-fetch";

export const POST = async (event: APIEvent) => {
  const url = new URL(event.request.url);
  const { token } = await event.request.json();
  if (!token) {
    return json({ error: `No token` }, { status: 400 });
  }
  const response = await fetch(`${import.meta.env.VITE_AUTH_URL}/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "github",
      code: token,
      redirect_uri: `${url.origin}/auth`,
    }),
  }).then((r) => r.json() as Promise<{ access_token: string }>);
  const c = serializeCookie("session", response.access_token, {
    path: "/",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });

  return json(
    {
      access_token: response.access_token,
    },
    {
      // redirect to the frontend
      status: 302,
      headers: {
        Authorization: `Bearer ${response.access_token}`,
        "Set-Cookie": c,
      },
    }
  );
};
