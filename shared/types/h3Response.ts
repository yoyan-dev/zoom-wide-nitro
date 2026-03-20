export interface H3Response<T = unknown> {
  status?: "ok" | "error";
  message?: string;
  statusCode?: number;
  statusMessage?: StatusMessage;
  data?: T;
  total?: number;
}

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
  | "service unavailable"
  | null;
