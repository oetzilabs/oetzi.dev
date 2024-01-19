import { MetaProvider } from "@solidjs/meta";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";
import { A } from "solid-start";
import { AuthProvider, isLoggedIn } from "./Auth";

const queryClient = new QueryClient();

export const Providers = (props: { children: any }) => {
  return (
    <>
      <MetaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <nav class="flex flex-row items-center justify-between flex-wrap bg-white dark:bg-black border-b border-neutral-300 dark:border-neutral-900 w-screen py-2">
              <div class="container mx-auto flex flex-row items-center justify-between flex-wrap py-2">
                <A href="/" class="hover:underline">
                  oetzi.dev
                </A>
                <Switch>
                  <Match when={isLoggedIn()}>
                    <button
                      class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-md px-3 py-1 font-medium shadow-sm"
                      type="submit"
                    >
                      Logout
                    </button>
                  </Match>
                  <Match when={!isLoggedIn()}>
                    <a
                      href={import.meta.env.VITE_AUTH_URL}
                      class="bg-black dark:bg-white text-white dark:text-black text-sm rounded-md px-3 py-1 font-medium shadow-sm"
                    >
                      Login
                    </a>
                  </Match>
                </Switch>
              </div>
            </nav>
            {props.children}
          </AuthProvider>
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
