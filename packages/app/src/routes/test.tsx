import { createEffect } from "solid-js";
import { listenToSuccess, processQueue, registerProcessor, testTrigger } from "../components/event/bus";
import { useAuth } from "../components/providers/OfflineFirst";

export default function TestPage() {
  const [user] = useAuth();

  createEffect(() => {
    const u = user();
    if (!u.isAuthenticated) return;
    const token = u.token;
    if (!token) return;
    console.log("registering processor");
    registerProcessor("test/test", (token: string, props: { haha: "hehe" }) => {
      return Promise.resolve({ haha: "hehe" });
    });
    const unsubscribe = processQueue(token);
    const unsub2 = listenToSuccess("test/test", (item: any) => {
      console.log("success", item);
    });
    return () => {
      console.log("unsubscribing");
      unsubscribe();
      unsub2();
    };
  });

  return (
    <div class="container mx-auto flex flex-col py-10">
      <button
        onClick={() => {
          testTrigger();
        }}
      >
        Test
      </button>
    </div>
  );
}
