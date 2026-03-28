import { setResponseStatus, type H3Event } from "h3";
import type { H3Response } from "../types";
import { toAppError } from "./errors";
import { apiError } from "./response";

export function handleRouteError(
  event: H3Event,
  error: unknown,
): H3Response<null> {
  const appError = toAppError(error);

  setResponseStatus(event, appError.statusCode);

  return apiError(
    appError.statusCode,
    appError.statusMessage,
    appError.message,
    {
      code: appError.code,
      details: appError.details,
    },
  );
}
