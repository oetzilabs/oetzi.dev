import { MetaProvider } from "@solidjs/meta";
import { A, action, cache, createAsync } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { Toaster } from "solid-toast";
import { getCookie } from "vinxi/server";
import { Session } from "../../utils/api/session";

const queryClient = new QueryClient();

export const Providers = (props: { children: any }) => {
  const logoutAction = action(Session.logout);
  const loggedIn = Session.isLoggedIn();
  return (
    <>
      <MetaProvider>
        <QueryClientProvider client={queryClient}>
          <nav class="flex flex-row items-center justify-between flex-wrap bg-white dark:bg-black border-b border-neutral-300 dark:border-neutral-900 w-screen py-2">
            <div class="container mx-auto flex flex-row items-center justify-between flex-wrap py-2">
              <A href="/" class="hover:underline">
                oetzi.dev
              </A>
              <Switch>
                <Match when={loggedIn()}>
                  <form action={logoutAction} method="post">
                    <button
                      class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-sm px-2 py-1 font-medium"
                      type="submit"
                    >
                      Logout
                    </button>
                  </form>
                </Match>
                <Match when={!loggedIn()}>
                  <a
                    href={import.meta.env.VITE_AUTH_URL}
                    class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-sm px-2 py-1 font-medium"
                  >
                    Login
                  </a>
                </Match>
              </Switch>
            </div>
          </nav>
          {props.children}
        </QueryClientProvider>
      </MetaProvider>
      {/* <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 2000,
        }}
      /> */}
    </>
  );
};
