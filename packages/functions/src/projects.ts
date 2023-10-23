import { ApiHandler, useFormData, useQueryParam, useQueryParams } from "sst/node/api";
import { AllWithFilterZod, Project } from "../../core/src/entities/projects";
import { getUser } from "./utils";
import { User } from "@oetzidev/core/entities/users";
import { GitHub } from "@oetzidev/core/github";
import { Stack } from "@oetzidev/core/entities/stacks";
import { StatusCodes } from "http-status-codes";

export const create = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const projectInput = Project.parse(Object.fromEntries(form.entries()));
  const result = await Project.create(user.id, projectInput);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const syncById = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  const id = useQueryParam("id");
  if (!id) throw new Error("No project id");
  const result = await Project.findById(id);
  if (!result) throw new Error("Project not found");
  const userToken = await User.getFreshAccessToken(user.id);
  const repo = await GitHub.getRepository(userToken, result.name);
  if (!repo) throw new Error("Repository not found");
  // analyze the project
  const isEmpty = await GitHub.isEmptyRepository(userToken, result.name);
  if (!isEmpty) {
    const files = await GitHub.getFiles(userToken, result.name, ["stacks"]);
    const fileContents: Array<string> = [];
    for await (const file of files) {
      const _file = await GitHub.readFileContent(userToken, result.name, file.path);
      fileContents.push(..._file);
    }
    const constructs = await Project.analyze(fileContents, ["StackContext", "use"]);
    const stacks = await Stack.findFromConstructs(Array.from(constructs));
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stacks.map((s) => s.name)),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([]),
  };
});

export const remove = ApiHandler(async (_evt) => {
  const [user] = await getUser();
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const projectId = form.get("id");
  if (!projectId) throw new Error("No project id");
  const result = await Project.remove(user.id, projectId);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
});

export const all = ApiHandler(async (_evt) => {
  const p = useQueryParams();
  if (!p) {
    const result = await Project.all();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  }
  const filterSP = AllWithFilterZod.safeParse(p);
  if (filterSP.success) {
    const result = await Project.allWithFilter(filterSP.data);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([]),
  };
});

export const analyze = ApiHandler(async (evt) => {
  const [user] = await getUser();
  if (!user) throw new Error("User not found");
  const id = useQueryParam("id");
  if (!id) throw new Error("No project id");
  const userToken = await User.getFreshAccessToken(user.id);
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");
  const isEmptyReposity = await GitHub.isEmptyRepository(userToken, project.name);
  if (!isEmptyReposity) {
    const files = await GitHub.getFiles(userToken, project.name, ["stacks"]);
    const fileContents: Array<string> = [];

    for await (const file of files) {
      const _file = await GitHub.readFileContent(userToken, project.name, file.path);
      fileContents.push(..._file);
    }

    const constructs = await Project.analyze(fileContents, ["StackContext", "use"]);
    const constructTypes = {
      Auth: "auth",
      SolidStartSite: "solidstartsite",
      Api: "api",
      Config: "config",
    } as const;
    const s = Array.from(constructs).sort();
    const result = s.map((s) => ({
      id: constructTypes[s as keyof typeof constructTypes],
      type: constructTypes[s as keyof typeof constructTypes],
      name: s,
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  };
});
