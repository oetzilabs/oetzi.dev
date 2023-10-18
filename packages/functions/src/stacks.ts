import { ApiHandler, useFormData, useQueryParam } from "sst/node/api";
import { getUser } from "./utils";
import { Stack } from "../../core/src/entities/stacks";
import fetch from "node-fetch";
import { StatusCodes } from "http-status-codes";

export const all = ApiHandler(async (_evt) => {
  const user = await getUser();
  if (!user) throw new Error("User not found");
  const stacks = await Stack.all();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stacks),
  };
});

export const checkUrl = ApiHandler(async (evt) => {
  const user = await getUser();
  if (!user) throw new Error("User not found");
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const url = form.get("url");
  if (!url) throw new Error("No url");
  // download the stack from the url
  const stackToml = await fetch(url).then((r) => r.text());
  // check if the stack is valid
  if (!stackToml) throw new Error("No stack");
  const collection = await Stack.isValid(stackToml);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(collection),
  };
});

export const checkFile = ApiHandler(async (evt) => {
  const user = await getUser();
  if (!user) throw new Error("User not found");
  const form = useFormData();
  if (!form) throw new Error("No form data");
  const file = form.get("file");
  if (!file) throw new Error("No file");
  let collection: Awaited<ReturnType<typeof Stack.isValid>> | undefined = undefined;
  try {
    collection = await Stack.isValid(file);
  } catch (e) {
    if (e instanceof Error) {
      console.log({ error: e.message });
      return {
        statusCode: StatusCodes.PRECONDITION_FAILED,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: e.message }),
      };
    }
    return {
      statusCode: StatusCodes.PRECONDITION_FAILED,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Unknown Error" }),
    };
  }
  collection =
    collection.length > 0
      ? collection
      : [
          {
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            description: "No description",
            hidden: false,
            id: "id",
            version: "0.0.0",
            name: "name",
            protected: "",
            template: `
const test = () => {
  alert("Hello World");
}
`,
          },
          {
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            description: "No description",
            hidden: false,
            id: "asdasd",
            version: "0.0.1:latest",
            name: "name-2",
            protected: "",
            template: `
const test2 = () => {
  alert("Hello World 2");
}
`,
          },
        ];
  return {
    statusCode: StatusCodes.OK,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(collection),
  };
});

export const calculateVersion = ApiHandler(async (evt) => {
  const user = await getUser();
  if (!user) throw new Error("User not found");
  const name = useQueryParam("name");
  if (!name) throw new Error("No name");
  const version = await Stack.calculateVersion(name, true); // with Hash
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(version),
  };
});
