export type InventoryStockReportFilters = {
  q?: string;
  product_id?: string;
};

export function applyStockReportFilters<TQuery extends { [key: string]: any }>(
  query: TQuery,
  filters: InventoryStockReportFilters,
): TQuery {
  let nextQuery = query;

  if (filters.q) {
    nextQuery = nextQuery.or(
      [
        `sku.ilike.%${filters.q}%`,
        `name.ilike.%${filters.q}%`,
        `description.ilike.%${filters.q}%`,
      ].join(","),
    );
  }

  if (filters.product_id) {
    nextQuery = nextQuery.eq("id", filters.product_id);
  }

  return nextQuery;
}
