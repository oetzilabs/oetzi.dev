import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import { z } from "zod";

export * as GitHub from "./index";

export const createRepository = z
  .function(
    z.tuple([
      z.string(),
      z.string(),
      z.object({
        name: z.string(),
        description: z.string(),
        private: z.boolean().default(true),
      }),
    ])
  )
  .implement(async (auth, org, options) => {
    const octokit = new Octokit({
      auth,
      request: {
        fetch,
      },
    });
    const { data } = await octokit.repos.createInOrg(Object.assign({ org }, options));
    return data;
  });

export const removeRepository = z.function(z.tuple([z.string(), z.string()])).implement(async (auth, repo) => {
  const octokit = new Octokit({
    auth,
    request: {
      fetch,
    },
  });
  const { status } = await octokit.repos.delete({
    owner: repo.split("/")[0],
    repo: repo.split("/")[1],
  });
  return status;
});

export const getRepository = z.function(z.tuple([z.string(), z.string()])).implement(async (auth, repo) => {
  const octokit = new Octokit({
    auth,
    request: {
      fetch,
    },
  });
  const { data } = await octokit.repos.get({
    owner: repo.split("/")[0],
    repo: repo.split("/")[1],
  });
  return data;
});

export const getFiles = z
  .function(z.tuple([z.string(), z.string(), z.array(z.string())]))
  .implement(async (auth, repo, paths) => {
    const octokit = new Octokit({
      auth,
      request: {
        fetch,
      },
    });
    let files = [];
    for await (const path of paths) {
      const { data } = await octokit.repos.getContent({
        owner: repo.split("/")[0],
        repo: repo.split("/")[1],
        path,
      });
      if (Array.isArray(data)) {
        files.push(...data);
      } else {
        files.push(data);
      }
    }

    return files;
  });

export const readFileContent = z
  .function(z.tuple([z.string(), z.string(), z.string()]))
  .implement(async (auth, repo, path) => {
    const octokit = new Octokit({
      auth,
      request: {
        fetch,
      },
    });
    const { data } = await octokit.repos.getContent({
      owner: repo.split("/")[0],
      repo: repo.split("/")[1],
      path,
    });
    if (!Array.isArray(data) && data.type === "file")
      return [
        {
          content: Buffer.from(data.content, data.encoding as BufferEncoding).toString(),
          path: data.path,
        },
      ];
    else if (Array.isArray(data)) {
      return (
        data.filter((d) => d.type === "file").filter((d) => d.content !== undefined) as unknown as Array<{
          content: string;
          encoding: BufferEncoding;
          path: string;
        }>
      ).map((d) => ({ content: Buffer.from(d.content, d.encoding as BufferEncoding).toString(), path: d.path }));
    } else {
      return [];
    }
  });

export const isEmptyRepository = z.function(z.tuple([z.string(), z.string()])).implement(async (auth, repo) => {
  const octokit = new Octokit({
    auth,
    request: {
      fetch,
    },
  });
  let x = false;
  const result:
    | {
        success: true;
        data: Awaited<ReturnType<typeof octokit.repos.getContent>>["data"];
        status: Awaited<ReturnType<typeof octokit.repos.getContent>>["status"];
      }
    | {
        success: false;
        error: string;
      } = await octokit.repos
    .getContent({
      path: "/",
      owner: repo.split("/")[0],
      repo: repo.split("/")[1],
    })
    .then((r) => {
      return {
        success: true,
        data: r.data,
        status: r.status,
      } as const;
    })
    .catch((e) => {
      return {
        success: false,
        error: e.message,
      } as const;
    });

  if (result.success) {
    if (Array.isArray(result.data)) {
      x = result.data.length === 0;
    }
  } else {
    if (result.error === "This repository is empty.") {
      x = true;
    }
  }

  return x;
});

export const getRepositoriesFromOrganization = z
  .function(z.tuple([z.string(), z.string()]))
  .implement(async (auth, org) => {
    const octokit = new Octokit({
      auth,
      request: {
        fetch,
      },
    });
    const { data } = await octokit.repos.listForOrg({
      org,
    });
    return data;
  });
