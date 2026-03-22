import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseRepositoryClient } from "../lib/supabase";
import { internalServerError } from "./errors";

type QueryError = Pick<PostgrestError, "message"> | null;

export type RepositoryListResult<T> = {
  data: T[];
  total: number;
};

export function useRepositoryClient(): SupabaseClient {
  return getSupabaseRepositoryClient();
}

export function ensureRepositorySuccess(
  error: QueryError,
  fallbackMessage?: string,
) {
  if (error) {
    throw internalServerError(fallbackMessage ?? error.message);
  }
}

export function mapOptionalRecord<T>(data: T | null): T | null {
  return data ?? null;
}

export function mapListResult<T>(input: {
  data: T[] | null;
  count: number | null;
}): RepositoryListResult<T> {
  return {
    data: input.data ?? [],
    total: input.count ?? 0,
  };
}
