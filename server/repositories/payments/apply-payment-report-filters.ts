import type { PaymentMethod, PaymentStatus } from "../../types";

export type PaymentReportFilters = {
  q?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  order_id?: string;
  from?: string;
  to?: string;
};

export function applyPaymentReportFilters<
  TQuery extends { [key: string]: any },
>(query: TQuery, filters: PaymentReportFilters): TQuery {
  let nextQuery = query;

  if (filters.q) {
    nextQuery = nextQuery.or(
      [
        `id.ilike.%${filters.q}%`,
        `transaction_ref.ilike.%${filters.q}%`,
        `order_id.ilike.%${filters.q}%`,
      ].join(","),
    );
  }

  if (filters.status) {
    nextQuery = nextQuery.eq("status", filters.status);
  }

  if (filters.method) {
    nextQuery = nextQuery.eq("method", filters.method);
  }

  if (filters.order_id) {
    nextQuery = nextQuery.eq("order_id", filters.order_id);
  }

  if (filters.from) {
    nextQuery = nextQuery.gte("created_at", filters.from);
  }

  if (filters.to) {
    nextQuery = nextQuery.lte("created_at", filters.to);
  }

  return nextQuery;
}
