import type { PaginationMeta } from "./pagination";

export type ApiStatus = "ok" | "error";

export type HttpStatusCode =
  | 200
  | 201
  | 204
  | 400
  | 401
  | 403
  | 404
  | 405
  | 409
  | 422
  | 500
  | 501
  | 503;

export type StatusMessage =
  | "ok"
  | "created"
  | "accepted"
  | "no content"
  | "bad request"
  | "unauthorized"
  | "forbidden"
  | "not found"
  | "method not allowed"
  | "conflict"
  | "unprocessable entity"
  | "internal server error"
  | "not implemented"
  | "service unavailable";

export type AppErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "method_not_allowed"
  | "conflict"
  | "unprocessable_entity"
  | "internal_error"
  | "not_implemented"
  | "service_unavailable";

export interface ApiErrorPayload {
  code: AppErrorCode | string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T = unknown> {
  status: "ok";
  statusCode: HttpStatusCode;
  statusMessage: StatusMessage;
  data: T;
  message?: string;
  total?: number;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  status: "error";
  statusCode: HttpStatusCode;
  statusMessage: StatusMessage;
  data: null;
  message: string;
  error: ApiErrorPayload;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ApiPaginationMeta = PaginationMeta;
export type H3Response<T = unknown> = ApiResponse<T>;
