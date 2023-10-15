import { Project } from "@oetzidev/core/entities/projects";
import { ApiHandler, useQueryParam } from "sst/node/api";
import { getUser } from "./utils";
import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import dayjs from "dayjs";

export const allProjects = ApiHandler(async (_evt) => {
  const user = await getUser();
  const result = await Project.allByUser(user.id);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const participatedProjects = ApiHandler(async (_evt) => {
  const user = await getUser();
  const result = await Project.allByUser(user.id);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const syncProjects = ApiHandler(async (_evt) => {
  const user = await getUser();
  const result = await Project.allByUser(user.id);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const allOrganizations = ApiHandler(async (_evt) => {
  const user = await getUser();
  const hasAccessTokens = user.sessions.find(
    (s) => s.access_token && s.expires_at && dayjs(s.expires_at).isAfter(dayjs())
  );
  if (!hasAccessTokens) throw new Error("No access tokens found");
  const access_token = hasAccessTokens.access_token;
  if (!access_token) throw new Error("No access token found");
  const okto = new Octokit({
    auth: `bearer ${access_token}`,
    request: { fetch },
  });
  const userRecord = await okto.users.getAuthenticated();
  if (userRecord.status !== 200) throw new Error("Not authenticated");
  const organizations = await okto.orgs.listForUser({ username: userRecord.data.login });
  let orgs: Record<string, any>[] = [];
  for (const org of organizations.data) {
    const repos = await okto.repos.listForOrg({ org: org.login });
    orgs.push({
      name: org.login,
      repos: repos.data.map((r) => r.name),
    });
  }
  // const organizations = await okto.orgs.listForAuthenticatedUser();
  // console.log(organizations.data.map((o) => o.login));
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orgs),
  };
});

export const projectIsAvailable = ApiHandler(async (_evt) => {
  const name = useQueryParam("name");
  const org = useQueryParam("organization");
  if (!name) throw new Error("No name");
  if (!org) throw new Error("No organization");
  const user = await getUser();
  const hasAccessTokens = user.sessions.find((s) => s.access_token);
  if (!hasAccessTokens) throw new Error("No access tokens found");
  const access_token = hasAccessTokens.access_token;
  if (!access_token) throw new Error("No access token found");
  const okto = new Octokit({
    auth: `bearer ${access_token}`,
    request: { fetch },
  });
  const userRecord = await okto.users.getAuthenticated();
  if (userRecord.status !== 200) throw new Error("Not authenticated");
  const repositoriesFromOrgs = await okto.repos.listForOrg({ org });

  const isAvailable = !repositoriesFromOrgs.data.find((r) => r.name === name);
  console.log(repositoriesFromOrgs.data.map((r) => r.name));

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(isAvailable),
  };
});
