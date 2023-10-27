import { For, Match, Switch, createEffect, createSignal, onCleanup } from "solid-js";
import { MyBus } from "../components/event/bus";
import { useAuth } from "../components/providers/OfflineFirst";
const bus = MyBus.instanciate<{
  "test/test": {
    register: (props: any) => Promise<{ halloRegister: string }>;
    queue: (token: string, props: { xD: string }) => Promise<{ halloQueue: string }>;
  };
}>().addProcessor("test/test", {
  queue: (token, props) => {
    console.log("queue", token, props);
    return Promise.resolve({ halloQueue: "ballo" });
  },
  register: (props) => {
    console.log("register", props);
    return Promise.resolve({ halloRegister: "ballo" });
  },
});
export default function TestPage() {
  const [user] = useAuth();
  const [results, setResults] = createSignal<{ halloQueue: string }[]>([]);

  createEffect(() => {
    const u = user();
    if (!u.isAuthenticated) return;
    const token = u.token;
    if (!token) return;
    bus.setToken(token);
    console.log("activating processing");
    console.log("activating listener");
    const unsubProcessing = bus.processQueue();
    const unsubListener = bus.listen("test/test", async (item) => {
      if (!item) return;
      setResults((r) => [...r, item]);
    });
    onCleanup(() => {
      console.log("unsubscribing");
      unsubProcessing();
      unsubListener();
    });
  });

  return (
    <div class="container mx-auto flex flex-col py-10">
      <For each={results()}>
        {(r) => (
          <div class="bg-white dark:bg-black/[0.01] border border-black/[0.05] dark:border-white/[0.02] rounded-md p-4 mb-4">
            {JSON.stringify(r)}
          </div>
        )}
      </For>
      <button
        onClick={async () => {
          if (!bus) {
            console.log("no bus()");
            return;
          }
          const xd = { xD: "xD" };
          console.log(xd);
          await bus.queue("test/test", xd);
        }}
      >
        Test
      </button>
    </div>
  );
}
