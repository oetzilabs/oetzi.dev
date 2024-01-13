import { redirect } from "@solidjs/router";
import { H3Event, getCookie, setCookie } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";
import { Queries } from "./queries";

export type UserSession = {
  token?: string;
};

export function getSession(event: H3Event) {
  return getCookie(event, "session");
}

export async function login(token: string) {
  const event = getRequestEvent();
  if (!event) {
    return;
  }
  setCookie(event, "session", token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
  });
}

export function isLoggedIn() {
  const event = getRequestEvent();
  if (!event) {
    return () => false;
  }
  const c = getCookie(event, "session");
  const loggedIn = () => c !== undefined;
  return loggedIn;
}

export async function logout() {
  "use server";
  const event = getRequestEvent();
  if (!event) {
    return;
  }
  setCookie(event, "session", "", {
    expires: new Date(0),
  });
  return redirect("/", 303);
}

export async function getProjects() {
  "use server";
  const response = await Queries.projects();
  return response;
}

export * as Session from "./session";
