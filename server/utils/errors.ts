import type {
  AppErrorCode,
  HttpStatusCode,
  StatusMessage,
} from "../../types";

type AppErrorConfig = {
  statusCode: HttpStatusCode;
  statusMessage: StatusMessage;
  defaultMessage: string;
};

const APP_ERROR_STATUS_MAP: Record<AppErrorCode, AppErrorConfig> = {
  bad_request: {
    statusCode: 400,
    statusMessage: "bad request",
    defaultMessage: "Bad request",
  },
  unauthorized: {
    statusCode: 401,
    statusMessage: "unauthorized",
    defaultMessage: "Unauthorized",
  },
  forbidden: {
    statusCode: 403,
    statusMessage: "forbidden",
    defaultMessage: "Forbidden",
  },
  not_found: {
    statusCode: 404,
    statusMessage: "not found",
    defaultMessage: "Not found",
  },
  method_not_allowed: {
    statusCode: 405,
    statusMessage: "method not allowed",
    defaultMessage: "Method not allowed",
  },
  conflict: {
    statusCode: 409,
    statusMessage: "conflict",
    defaultMessage: "Conflict",
  },
  unprocessable_entity: {
    statusCode: 422,
    statusMessage: "unprocessable entity",
    defaultMessage: "Unprocessable entity",
  },
  internal_error: {
    statusCode: 500,
    statusMessage: "internal server error",
    defaultMessage: "Internal server error",
  },
  not_implemented: {
    statusCode: 501,
    statusMessage: "not implemented",
    defaultMessage: "Not implemented",
  },
  service_unavailable: {
    statusCode: 503,
    statusMessage: "service unavailable",
    defaultMessage: "Service unavailable",
  },
};

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly statusMessage: StatusMessage;

  constructor(
    public readonly code: AppErrorCode,
    message?: string,
    public readonly details?: unknown,
  ) {
    const config = APP_ERROR_STATUS_MAP[code];

    super(message ?? config.defaultMessage);
    this.name = "AppError";
    this.statusCode = config.statusCode;
    this.statusMessage = config.statusMessage;
  }
}

export function getErrorStatus(code: AppErrorCode): AppErrorConfig {
  return APP_ERROR_STATUS_MAP[code];
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(
    "internal_error",
    error instanceof Error ? error.message : "Internal server error",
  );
}

export function badRequestError(message = "Bad request") {
  return new AppError("bad_request", message);
}

export function unauthorizedError(message = "Unauthorized") {
  return new AppError("unauthorized", message);
}

export function forbiddenError(message = "Forbidden") {
  return new AppError("forbidden", message);
}

export function conflictError(message = "Conflict") {
  return new AppError("conflict", message);
}

export function notFoundError(message = "Not found") {
  return new AppError("not_found", message);
}

export function internalServerError(message = "Internal server error") {
  return new AppError("internal_error", message);
}
