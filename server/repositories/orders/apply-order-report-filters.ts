import type { OrderStatus } from "../../../types";

export type OrderReportFilters = {
  q?: string;
  status?: OrderStatus;
  customer_id?: string;
  from?: string;
  to?: string;
};

export function applyOrderReportFilters<TQuery extends { [key: string]: any }>(
  query: TQuery,
  filters: OrderReportFilters,
): TQuery {
  let nextQuery = query;

  if (filters.q) {
    nextQuery = nextQuery.or(
      [`id.ilike.%${filters.q}%`, `notes.ilike.%${filters.q}%`].join(","),
    );
  }

  if (filters.status) {
    nextQuery = nextQuery.eq("status", filters.status);
  }

  if (filters.customer_id) {
    nextQuery = nextQuery.eq("customer_id", filters.customer_id);
  }

  if (filters.from) {
    nextQuery = nextQuery.gte("created_at", filters.from);
  }

  if (filters.to) {
    nextQuery = nextQuery.lte("created_at", filters.to);
  }

  return nextQuery;
}
