import { createEventHub, createEventStack } from "@solid-primitives/event-bus";
import { createEffect, onCleanup } from "solid-js";
import { UseAuth } from "../providers/OfflineFirst";

type Queue<
  T extends {
    [key: string]: {
      register: (props: any) => Promise<any>;
      queue: (token: string, props: any) => Promise<any>;
    };
  }
> =
  | {
      status: "pending";
      type: keyof T;
      id: string;
      payload: Parameters<T[keyof T]["queue"]>[1];
    }
  | {
      status: "success";
      type: keyof T;
      id: string;
      result: Awaited<ReturnType<T[keyof T]["register"]>>;
    }
  | {
      status: "error";
      type: keyof T;
      id: string;
      error: any;
    };
class Singleton {
  private static instances: Map<string, any> = new Map();

  public static getInstance<T>(key: string, createInstance: () => T): T {
    if (!Singleton.instances.has(key)) {
      Singleton.instances.set(key, createInstance());
    }
    return Singleton.instances.get(key) as T;
  }
}
export class MyBus<
  T extends {
    [key: string]: {
      register: (props: any) => Promise<any>;
      queue: (token: string, props: any) => Promise<any>;
    };
  }
> {
  private processors: T = {} as T;
  private token: string | null = null;
  private hub = createEventHub((bus) => ({
    user: bus<UseAuth>(),
    queue: createEventStack<Queue<T>>(),
  }));
  private intv: NodeJS.Timeout | null = null;

  private constructor() {}
  registerProcessor = <K extends keyof T>(type: K, fn: T[K]["register"]) => {
    this.processors[type].register = fn;
  };
  setToken = (token: string) => {
    this.token = token;
    return this;
  };
  getProcessors = () => {
    return this.processors;
  };
  getResults = () => {
    return this.hub.queue.value().filter((item) => item.status === "success");
  };
  public static getInstance<
    TObj extends {
      [key: string]: {
        register: (props: any) => Promise<any>;
        queue: (token: string, props: any) => Promise<any>;
      };
    }
  >(): MyBus<TObj> {
    return Singleton.getInstance("MyBus", () => new MyBus<TObj>());
  }
  processQueue = () => {
    const token = this.token;
    const queue = this.hub.queue.listen(async (item) => {
      if (!item) return;
      const processors = this.getProcessors();
      const processor = processors[item.event.type];
      if (!processor) return;
      const status = item.event.status;
      if (status === "success") return;
      if (status === "error") return;
      if (!token) throw new Error("no token");
      const result = await processor.queue(token, item.event.payload);
      if (!result) return;
      this.hub.queue.emit({
        status: "success",
        type: item.event.type,
        id: item.event.id,
        result,
      });
    });
    createEffect(() => {
      const oldInterv = this.intv;
      if (oldInterv) return;
      const interval = setInterval(() => {
        this.hub.queue.setValue((q) => {
          const oldQ = q;
          const newQ = [];
          for (const item of oldQ) {
            if (item.status === "pending") continue; // skip pending
            newQ.push(item);
          }
          return newQ;
        });
      }, 5000);
      this.intv = interval;
      onCleanup(() => {
        clearInterval(interval);
      });
    });
    return queue;
  };
  listen = (type: keyof T, fn: (item: Awaited<ReturnType<T[keyof T]["queue"]>>) => Promise<void>) => {
    const unsubscribe = this.hub.queue.listen(async (item) => {
      if (!item) return;
      if (item.event.status !== "success") return;
      if (item.event.type !== type) return;
      await fn(item.event.result);
    });
    return unsubscribe;
  };
  queue = (type: keyof T, payload: Parameters<T[keyof T]["queue"]>[1]) => {
    this.hub.queue.emit({
      id: Math.random().toString(36).substring(7),
      type,
      status: "pending",
      payload,
    });
    return this;
  };
  addProcessor = (type: keyof T, processor: T[keyof T]) => {
    this.processors[type] = processor;
    return this;
  };
}
