// @refresh reload
import { Suspense, createEffect, createSignal, onCleanup } from "solid-js";
import { Body, ErrorBoundary, Head, Html, Meta, Scripts, Title } from "solid-start";
import Content from "./components/Content";
import { Providers } from "./components/providers";
import "./root.css";

export default function Root() {
  // colormode
  const [colorMode, setColorMode] = createSignal<"dark" | "light">("dark");
  const toggleColorMode = async () => {
    const cm = colorMode() === "light" ? "dark" : "light";
    setColorMode(cm);
    // store color mode in local storage
    window.localStorage.setItem("colorMode", cm);
  };

  createEffect(() => {
    // get color mode from local storage

    const cm = (window.localStorage.getItem("colorMode") as "dark" | "light" | null) ?? "dark";
    if (cm) {
      setColorMode(cm);
    }

    // keybind CTRL+B
    const handler = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        await toggleColorMode();
      }
    };

    document.addEventListener("keydown", handler);
    onCleanup(() => {
      document.removeEventListener("keydown", handler);
    });
  });

  return (
    <Html lang="en" classList={{ dark: colorMode() === "dark" }}>
      <Head>
        <Title>oetzi.dev</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="bg-white dark:bg-black text-black dark:text-white">
        <Suspense>
          <ErrorBoundary>
            <Providers>
              <Content />
            </Providers>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
