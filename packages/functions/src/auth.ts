import { User } from "@oetzidev/core/entities/users";
import dayjs from "dayjs";
import fetch from "node-fetch";
import { Config } from "sst/node/config";
import { AuthHandler, GithubAdapter, createSessionBuilder } from "sst/node/future/auth";
import { Octokit } from "@octokit/rest";
import { useCookies } from "sst/node/api";

export const sessions = createSessionBuilder<{
  user: {
    id: string;
    email: string;
  };
}>();

export type UserSession = ReturnType<typeof sessions.use>;
export type UserSessionAuthenticated = Extract<UserSession, { type: "user" }>;

export const handler = AuthHandler({
  sessions,
  callbacks: {
    async error(error) {
      console.error(error);
      return { body: JSON.stringify(error), statusCode: 500, headers: {} };
    },
    async index(event) {
      return {
        body: JSON.stringify({ event }),
      };
    },
    connect: {
      async success(session, input) {
        return {
          body: JSON.stringify({ session, input }),
        };
      },
    },
    auth: {
      async allowClient(clientID, redirect) {
        if (clientID === "github") return true;
        return false;
      },
      async error(error) {
        console.error(error);
        return { body: JSON.stringify(error), statusCode: 500, headers: {} };
      },
      async success(input, response) {
        if (input.provider === "github") {
          const { access_token, refresh_token, expires_at, expires_in } = input.tokenset;
          const okto = new Octokit({
            auth: `bearer ${access_token}`,
          });
          const user = await okto.users.getAuthenticated();
          const email = user.status === 200 ? user.data.email : undefined;
          if (!email) throw new Error("No email");
          let userRecord = await User.findByEmail(email);
          if (!userRecord) {
            // is the user allowed to sign up?
            // check if the email is in the allowed table
            const allowed = await User.isAllowedToSignUp({ email });
            if (!allowed) throw new Error("Not allowed to sign up");
            userRecord = await User.create(
              {
                email,
                name: user.data.name ?? user.data.login,
              },
              {
                image: user.data.avatar_url,
                locale: user.data.location,
                preferredUsername: user.data.login,
              },
              {
                access_token,
                refresh_token,
                expires_at: expires_at ? dayjs.unix(expires_at).toDate() : null,
                expires_in: expires_in ? dayjs.unix(expires_in).toDate() : null,
              }
            );
          } else {
            await User.updateTokens(userRecord.id, {
              access_token,
              refresh_token,
              expires_at: expires_at ? expires_at : null,
              expires_in: expires_in ? expires_in : null,
            });
          }
          return response.session({
            type: "user",
            properties: {
              id: userRecord.id,
              email: userRecord.email,
            },
          });
        }

        throw new Error("Unknown provider");
      },
    },
  },
  providers: {
    github: GithubAdapter({
      clientID: Config.GITHUB_APP_CLIENT_ID,
      clientSecret: Config.GITHUB_APP_CLIENT_SECRET,
      scope: "user",
      mode: "oauth",
    }),
  },
  onError: async (error) => {
    return { body: JSON.stringify(error), statusCode: 500, headers: {} };
  },
});
