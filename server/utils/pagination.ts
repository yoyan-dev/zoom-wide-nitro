export type PaginationInput = {
  page?: number;
  limit?: number;
};

export type PaginationResult = {
  page: number;
  limit: number;
  from: number;
  to: number;
};

export function getPagination(input: PaginationInput): PaginationResult {
  const page = Math.max(1, Math.trunc(input.page ?? 1));
  const limit = Math.max(1, Math.trunc(input.limit ?? 10));
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
