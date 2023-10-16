import { Octokit } from "@octokit/rest";
import { Project } from "@oetzidev/core/entities/projects";
import fetch from "node-fetch";
import { ApiHandler, useQueryParam } from "sst/node/api";
import { User, getFreshAccessToken } from "../../core/src/entities/users";
import { getUser } from "./utils";

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
  const freshAccessToken = await getFreshAccessToken(user.id);

  const okto = new Octokit({
    auth: `bearer ${freshAccessToken}`,
    request: { fetch },
  });

  const userRecord = await okto.users.getAuthenticated();
  if (userRecord.status !== 200) throw new Error("Not authenticated");

  const organizations = await okto.orgs.listForAuthenticatedUser();

  let orgs: Record<
    string,
    {
      repos: Array<{
        name: string;
        type: "public" | "private";
        isTemplate: boolean;
      }>;
    }
  > = {};

  for (const org of organizations.data) {
    const repos = await okto.repos.listForOrg({ org: org.login, type: "all" });
    orgs[org.login] = {
      repos: repos.data.map((r) => ({
        name: r.name,
        type: r.private ? "private" : "public",
        isTemplate: r.is_template ?? false,
      })),
    };
  }

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

export const allTemplates = ApiHandler(async (_evt) => {
  const user = await getUser();
  const result = await User.allTemplates(user.id);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});
