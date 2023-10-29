import { Octokit } from "@octokit/rest";
import { Project } from "@oetzidev/core/entities/projects";
import fetch from "node-fetch";
import { ApiHandler, useFormData, useQueryParam } from "sst/node/api";
import { User, getFreshAccessToken } from "../../core/src/entities/users";
import { getUser } from "./utils";
import { Stack } from "@oetzidev/core/entities/stacks";
import { StatusCodes } from "http-status-codes";
import { GitHub } from "@oetzidev/core/github";
import { Link } from "@oetzidev/core/entities/links";

export const allProjects = ApiHandler(async (_evt) => {
  const [user] = await getUser();
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
  const [user] = await getUser();
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
  const [user] = await getUser();
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
  const [user] = await getUser();
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
  const [user] = await getUser();
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

export const createStack = ApiHandler(async (evt) => {
  const [user] = await getUser();
  if (!user) throw new Error("User not found");
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const name = form.get("name");
  const description = form.get("description");
  const technologies = form.getAll("technologies");
  const protected_ = form.get("protected");
  if (!name) throw new Error("No name");
  if (!description) throw new Error("No description");
  if (!technologies) throw new Error("No technologies");
  if (Array.isArray(technologies)) throw new Error("Technologies is not an array");
  if (!protected_) throw new Error("No protected");

  const result = await Stack.create(user.id, {
    version: "0.0.1",
    name,
    description,
    hidden: false,
    protected: protected_,
    technologies,
  });

  return {
    statusCode: StatusCodes.OK,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const allUserStacks = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  const result = await User.allUserStacks(user.id);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const getProject = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  const id = useQueryParam("id");
  if (!id) throw new Error("No id");
  const result = await Project.findById(id);
  if (!result) throw new Error("No project found");
  if (result.ownerId !== user.id) throw new Error("Not authorized");
  const userToken = await User.getFreshAccessToken(user.id);

  const constructHrefs = await Link.listBy("constructs");
  let result_: typeof result & {
    analysis?: Awaited<ReturnType<typeof Project.analyze>>;
  } = result;
  const isEmpty = await GitHub.isEmptyRepository(userToken, result_.name);
  if (!isEmpty) {
    const files = await GitHub.getFiles(userToken, result_.name, ["stacks"]);
    const fileContents: Array<{
      content: string;
      path: string;
    }> = [];

    for await (const file of files) {
      const _file = await GitHub.readFileContent(userToken, result_.name, file.path);
      fileContents.push(..._file);
    }

    const projectAnalysis = await Project.analyze(fileContents, {
      exclude: {
        constructs: ["StackContext", "use"],
      },
    });

    const s = Array.from(
      new Set(
        Object.entries(projectAnalysis.constructs)
          .filter(([_, v]) => v)
          .map(([k]) => k)
      )
    ).sort();
    if (!result_.analysis)
      result_.analysis = {
        constructs: {},
      };
    result_.analysis.constructs = projectAnalysis.constructs;
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result_),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});
