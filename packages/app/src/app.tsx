// @refresh reload
import { ColorModeProvider, ColorModeScript, cookieStorageManagerSSR } from "@kobalte/core";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import "./app.css";

export default function App() {
  const storageManager = cookieStorageManagerSSR(isServer ? "kb-color-mode=dark" : document.cookie);
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div class="fixed z-[99999] flex flex-row items-center justify-center inset-0 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50]">
          <div class="flex flex-col gap-2">
            <span class="text-red-500 font-bold">Some Error occured...</span>
            <pre>{JSON.stringify(error, null, 2)}</pre>
            <button onClick={() => reset()}>RESET</button>
          </div>
        </div>
      )}
    >
      <Router
        root={(props) => (
          <>
            <MetaProvider>
              <Title>oetzi.dev</Title>
              <Suspense>
                <ColorModeScript storageType={storageManager.type} initialColorMode="system" />
                <ColorModeProvider storageManager={storageManager}>
                  <div
                    class="w-full flex flex-col"
                    style={{
                      "flex-grow": "1",
                      "min-height": "100vh",
                    }}
                  >
                    {props.children}
                  </div>
                </ColorModeProvider>
              </Suspense>
            </MetaProvider>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </ErrorBoundary>
  );
}
