import type {
  ApiErrorPayload,
  ApiErrorResponse,
  ApiPaginationMeta,
  ApiSuccessResponse,
  H3Response,
  HttpStatusCode,
  NumericSummary,
  StatusMessage,
  SummaryResponse,
} from "../../types";

type ResponseOptions = {
  total?: number;
  message?: string;
  meta?: ApiPaginationMeta;
};

type ErrorResponseOptions = {
  code?: string;
  details?: unknown;
};

function buildMeta(options?: ResponseOptions): ApiPaginationMeta | undefined {
  if (!options?.meta && options?.total === undefined) {
    return undefined;
  }

  return {
    total: options?.meta?.total ?? options?.total,
    page: options?.meta?.page,
    limit: options?.meta?.limit,
    totalPages: options?.meta?.totalPages,
  };
}

function buildSuccessResponse<T>(
  status: "ok",
  statusCode: HttpStatusCode,
  statusMessage: StatusMessage,
  data: T,
  options?: ResponseOptions,
): ApiSuccessResponse<T> {
  return {
    status,
    statusCode,
    statusMessage,
    data,
    total: options?.total,
    meta: buildMeta(options),
    message: options?.message,
  };
}

function buildErrorPayload(
  statusMessage: StatusMessage,
  message: string,
  options?: ErrorResponseOptions,
): ApiErrorPayload {
  return {
    code: options?.code ?? statusMessage ?? undefined,
    message,
    details: options?.details,
  };
}

function buildErrorResponse(
  statusCode: HttpStatusCode,
  statusMessage: StatusMessage,
  message: string,
  options?: ErrorResponseOptions,
): ApiErrorResponse {
  return {
    status: "error",
    statusCode,
    statusMessage,
    data: null,
    message,
    error: buildErrorPayload(statusMessage, message, options),
  };
}

export function success<T>(
  data: T,
  options?: ResponseOptions,
): H3Response<T> {
  return buildSuccessResponse("ok", 200, "ok", data, options);
}

export function ok<T>(data: T, options?: ResponseOptions): H3Response<T> {
  return success(data, options);
}

export function created<T>(data: T, options?: ResponseOptions): H3Response<T> {
  return buildSuccessResponse("ok", 201, "created", data, options);
}

export function paginated<T>(
  data: T,
  meta: ApiPaginationMeta,
  options?: Omit<ResponseOptions, "meta" | "total">,
): H3Response<T> {
  return ok(data, {
    ...options,
    total: meta.total,
    meta,
  });
}

export function summary<TSummary extends NumericSummary>(
  data: SummaryResponse<TSummary> | TSummary,
  options?: Omit<ResponseOptions, "meta" | "total">,
): H3Response<SummaryResponse<TSummary>> {
  const normalizedData =
    "summary" in data ? data : ({ summary: data } as SummaryResponse<TSummary>);

  return ok(normalizedData, options);
}

export function noContent(message = "no content"): H3Response<null> {
  return buildSuccessResponse("ok", 204, "no content", null, {
    message,
  });
}

export function apiError(
  statusCode: HttpStatusCode,
  statusMessage: StatusMessage,
  message: string,
  options?: ErrorResponseOptions,
): H3Response<null> {
  return buildErrorResponse(statusCode, statusMessage, message, options);
}

export function badRequest(message = "Bad request"): H3Response<null> {
  return buildErrorResponse(400, "bad request", message);
}

export function notFound(message = "Not found"): H3Response<null> {
  return buildErrorResponse(404, "not found", message);
}

export function internalError(
  message = "Internal server error",
): H3Response<null> {
  return buildErrorResponse(500, "internal server error", message);
}
