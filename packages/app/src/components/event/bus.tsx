import { User } from "@oetzidev/core/entities/users";
import { createEventHub, createEventStack } from "@solid-primitives/event-bus";
import { createEffect, createSignal } from "solid-js";
import { Mutations } from "../../utils/api/mutations";

type RegisterFn = (token: string, props: any) => any;

const [queueProcessors, setQueueProcessors] = createSignal<Record<string, RegisterFn>>({});

type Queue =
  | {
      status: "pending";
      type: string;
      id: string;
      payload: any;
    }
  | {
      status: "success";
      type: string;
      id: string;
      result: any;
    }
  | {
      status: "error";
      type: string;
      id: string;
      error: any;
    };

type UseAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  expiresAt: Date | null;
  user: User.Frontend | null;
};

export const hub = createEventHub((bus) => ({
  user: bus<UseAuth>(),
  queue: createEventStack<Queue>(),
}));

export const login = (token: string) => {
  hub.user.emit({
    isLoading: false,
    isAuthenticated: true,
    token,
    expiresAt: null,
    user: null,
  });
};

export const logout = () => {
  hub.user.emit({
    isLoading: false,
    isAuthenticated: false,
    token: null,
    expiresAt: null,
    user: null,
  });
};

export const registerProcessor = <T extends string, K>(type: T, payloadFn: RegisterFn) => {
  const oldProcessors = queueProcessors();
  if (!oldProcessors[type]) {
    const newProcessors = { ...oldProcessors, [type]: payloadFn };
    setQueueProcessors(newProcessors);
  } else {
    console.warn(`Processor for ${type} already registered`);
  }
};

export const listenToSuccess = (type: string, fn: (item: any) => void) => {
  const unsubscribe = hub.queue.listen((item) => {
    if (!item) return;
    if (item.event.status !== "success") return;
    if (item.event.type !== type) return;
    fn(item);
  });
  return unsubscribe;
};

export const processQueue = (token: string) => {
  const queue = hub.queue.listen(async (item) => {
    if (!item) return;
    const processors = queueProcessors();
    const processor = processors[item.event.type];
    if (!processor) return;
    const status = item.event.status;
    if (status === "success") return;
    if (status === "error") return;
    const result = await processor(token, item.event.payload);
    if (!result) return;
    hub.queue.emit({
      status: "success",
      type: item.event.type,
      id: item.event.id,
      result,
    });
  });
  createEffect(() => {
    // interval cleanup of success events
    const interval = setInterval(() => {
      hub.queue.setValue((q) => {
        const oldQ = q;
        const newQ = [];
        for (const item of oldQ) {
          if (item.status === "pending") continue; // skip pending
          newQ.push(item);
        }
        return newQ;
      });
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  });
  return queue;
};

export const BASE_QUEUE_PROCESSORS = () => {
  registerProcessor("project/create", (token: string, props: Parameters<typeof Mutations.Projects.create>[1]) => {
    return Mutations.Projects.create(token, props);
  });
  registerProcessor("project/sync", (token: string, props: Parameters<typeof Mutations.Projects.syncOne>[1]) => {
    return Mutations.Projects.syncOne(token, props);
  });
  registerProcessor("project/delete", (token: string, props: Parameters<typeof Mutations.Projects.remove>[1]) => {
    return Mutations.Projects.remove(token, props);
  });
  registerProcessor("project/update", (token: string, props: Parameters<typeof Mutations.Projects.update>[1]) => {
    return Mutations.Projects.update(token, props);
  });
};

export const addProject = (project: Parameters<typeof Mutations.Projects.create>[1]) => {
  hub.queue.emit({
    type: "project/create",
    status: "pending",
    id: Math.random().toString(36).substring(7),
    payload: project,
  });
};

export const testTrigger = () => {
  hub.queue.emit({
    type: "test/test",
    status: "pending",
    id: Math.random().toString(36).substring(7),
    payload: { haha: "hehe" },
  });
};
