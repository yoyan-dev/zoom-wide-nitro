import type { H3Response, StatusMessage } from "../../types";

type ResponseOptions = {
  total?: number;
  message?: string;
};

function buildResponse<T>(
  status: "ok" | "error",
  statusCode: number,
  statusMessage: StatusMessage,
  data?: T,
  options?: ResponseOptions,
): H3Response<T> {
  return {
    status,
    statusCode,
    statusMessage,
    data,
    total: options?.total,
    message: options?.message,
  };
}

export function ok<T>(data: T, options?: ResponseOptions): H3Response<T> {
  return buildResponse("ok", 200, "ok", data, options);
}

export function created<T>(data: T, options?: ResponseOptions): H3Response<T> {
  return buildResponse("ok", 201, "created", data, options);
}

export function noContent(message = "no content"): H3Response<null> {
  return {
    status: "ok",
    statusCode: 204,
    statusMessage: "no content",
    data: null,
    message,
  };
}

export function badRequest(message = "Bad request"): H3Response<null> {
  return {
    status: "error",
    statusCode: 400,
    statusMessage: "bad request",
    data: null,
    message,
  };
}

export function notFound(message = "Not found"): H3Response<null> {
  return {
    status: "error",
    statusCode: 404,
    statusMessage: "not found",
    data: null,
    message,
  };
}

export function internalError(message = "Internal server error"): H3Response<null> {
  return {
    status: "error",
    statusCode: 500,
    statusMessage: "internal server error",
    data: null,
    message,
  };
}
