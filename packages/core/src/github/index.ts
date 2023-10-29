import { z } from "zod";
import { Octokit } from "@octokit/rest";

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
    });
    const { data } = await octokit.repos.createInOrg(Object.assign({ org }, options));
    return data;
  });

export const removeRepository = z.function(z.tuple([z.string(), z.string()])).implement(async (auth, repo) => {
  const octokit = new Octokit({
    auth,
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
  });
  const { data } = await octokit.repos.getContent({ path: "", owner: repo.split("/")[0], repo: repo.split("/")[1] });
  let x = false;
  if (Array.isArray(data)) {
    x = data.length === 0;
  }
  return x;
});
