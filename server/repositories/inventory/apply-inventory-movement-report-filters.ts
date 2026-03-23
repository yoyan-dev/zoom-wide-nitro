import type { InventoryMovementType } from "../../../types";

export type InventoryMovementReportFilters = {
  q?: string;
  product_id?: string;
  movement_type?: InventoryMovementType;
  from?: string;
  to?: string;
};

export function applyInventoryMovementReportFilters<
  TQuery extends { [key: string]: any },
>(query: TQuery, filters: InventoryMovementReportFilters): TQuery {
  let nextQuery = query;

  if (filters.q) {
    nextQuery = nextQuery.or(
      [
        `reference_id.ilike.%${filters.q}%`,
        `reference_type.ilike.%${filters.q}%`,
        `note.ilike.%${filters.q}%`,
      ].join(","),
    );
  }

  if (filters.product_id) {
    nextQuery = nextQuery.eq("product_id", filters.product_id);
  }

  if (filters.movement_type) {
    nextQuery = nextQuery.eq("movement_type", filters.movement_type);
  }

  if (filters.from) {
    nextQuery = nextQuery.gte("created_at", filters.from);
  }

  if (filters.to) {
    nextQuery = nextQuery.lte("created_at", filters.to);
  }

  return nextQuery;
}
