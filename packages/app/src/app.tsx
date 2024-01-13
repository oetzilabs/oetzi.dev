// @refresh reload
import { Router } from "@solidjs/router";
import { Suspense, createEffect, createSignal, onCleanup } from "solid-js";
import { Providers } from "./components/providers";
import { FileRoutes } from "@solidjs/start";
import "./app.css";

export default function App() {
  // colormode
  const [colorMode, setColorMode] = createSignal<"dark" | "light">("dark");
  const toggleColorMode = async () => {
    const cm = colorMode() === "light" ? "dark" : "light";
    setColorMode(cm);
    const html = document.querySelector("html");
    if (html) {
      html.classList.toggle("dark");
    }
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
    <Router
      root={(props) => (
        <>
          <Suspense>
            <Providers>{props.children}</Providers>
          </Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
