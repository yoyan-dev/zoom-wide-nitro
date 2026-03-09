import type {
  PostgrestError,
  SupabaseClient,
} from "@supabase/supabase-js";
import { createError, type H3Event } from "h3";
import type { Database } from "../../shared/types";

export function getSupabaseClient(event: H3Event): SupabaseClient<Database> {
  if (!event.context.supabase) {
    throw createError({
      statusCode: 500,
      statusMessage: "Supabase client is not attached to event context.",
    });
  }

  return event.context.supabase;
}

export function assertSupabaseSuccess(
  error: PostgrestError | null,
  message: string,
  statusCode = 500
): void {
  if (error) {
    throw createError({
      statusCode,
      statusMessage: message,
      data: {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      },
    });
  }
}

export function assertExists<T>(
  value: T | null | undefined,
  message: string
): T {
  if (value === null || value === undefined) {
    throw createError({
      statusCode: 404,
      statusMessage: message,
    });
  }

  return value;
}
