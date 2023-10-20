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
