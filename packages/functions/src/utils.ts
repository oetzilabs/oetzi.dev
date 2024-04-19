import { StatusCodes } from "http-status-codes";

export const json = (body: unknown, status: StatusCodes = StatusCodes.OK) => {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};

export const text = (body: string, status: StatusCodes = StatusCodes.OK) => {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "text/plain",
    },
    body,
  };
};

export const error = (body: unknown, status: StatusCodes = StatusCodes.BAD_REQUEST) => {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify(body),
  };
};
