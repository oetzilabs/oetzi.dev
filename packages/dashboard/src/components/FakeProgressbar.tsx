import { createSignal, createEffect } from "solid-js";
import { toast } from "solid-toast";

export function FakeProgressBar(props: { time: number }) {
  const [progress, setProgress] = createSignal(0);
  createEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => p + 1);
    }, props.time / 100);
    return () => clearInterval(interval);
  });
  createEffect(() => {
    // if progress is 100, dismiss toast
    if (progress() === 100) toast.dismiss();
  });
  return (
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
      <div
        class="h-full bg-black dark:bg-white/50"
        style={{
          width: `${progress()}%`,
        }}
      ></div>
    </div>
  );
}
