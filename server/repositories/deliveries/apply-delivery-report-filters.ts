import type { DeliveryStatus } from "../../../types";

export type DeliveryReportFilters = {
  q?: string;
  status?: DeliveryStatus;
  order_id?: string;
  driver_id?: string;
  from?: string;
  to?: string;
};

export function applyDeliveryReportFilters<TQuery extends { [key: string]: any }>(
  query: TQuery,
  filters: DeliveryReportFilters,
): TQuery {
  let nextQuery = query;

  if (filters.q) {
    nextQuery = nextQuery.ilike("vehicle_number", `%${filters.q}%`);
  }

  if (filters.status) {
    nextQuery = nextQuery.eq("status", filters.status);
  }

  if (filters.order_id) {
    nextQuery = nextQuery.eq("order_id", filters.order_id);
  }

  if (filters.driver_id) {
    nextQuery = nextQuery.eq("driver_id", filters.driver_id);
  }

  if (filters.from) {
    nextQuery = nextQuery.gte("created_at", filters.from);
  }

  if (filters.to) {
    nextQuery = nextQuery.lte("created_at", filters.to);
  }

  return nextQuery;
}
