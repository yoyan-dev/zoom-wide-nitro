import type { PaginationMeta } from "../../types";

export type PaginationInput = {
  page?: number;
  limit?: number;
  defaultLimit?: number;
  maxLimit?: number;
};

export type PaginationResult = {
  page: number;
  limit: number;
  from: number;
  to: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function sanitizePositiveInteger(value: number | undefined, fallback: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value));
}

export function getPagination(input: PaginationInput = {}): PaginationResult {
  const page = sanitizePositiveInteger(input.page, DEFAULT_PAGE);
  const requestedLimit = sanitizePositiveInteger(
    input.limit,
    input.defaultLimit ?? DEFAULT_LIMIT,
  );
  const limit = Math.min(requestedLimit, input.maxLimit ?? MAX_LIMIT);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return {
    page,
    limit,
    from,
    to,
  };
}

export function getTotalPages(total: number, limit: number): number {
  if (limit <= 0) {
    return 0;
  }

  return Math.ceil(total / limit);
}

export function getPaginationMeta(input: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  return {
    page: input.page,
    limit: input.limit,
    total: input.total,
    totalPages: getTotalPages(input.total, input.limit),
  };
}
