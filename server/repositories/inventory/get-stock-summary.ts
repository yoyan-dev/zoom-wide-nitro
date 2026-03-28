import type { InventoryStockSummary, Product } from "../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyStockReportFilters,
  type InventoryStockReportFilters,
} from "./apply-stock-report-filters";

export async function getStockSummaryRecord(
  filters: InventoryStockReportFilters,
): Promise<InventoryStockSummary> {
  const supabase = useRepositoryClient();
  let query = supabase
    .from("products")
    .select("id, stock_quantity, minimum_stock_quantity");

  query = applyStockReportFilters(query, filters);

  const { data, error } = await query;

  ensureRepositorySuccess(error);

  const rows = (data ?? []) as Array<
    Pick<Product, "stock_quantity" | "minimum_stock_quantity"> & { id: string }
  >;

  let totalStockUnits = 0;
  let lowStockProducts = 0;
  let outOfStockProducts = 0;

  for (const row of rows) {
    const stockQuantity = Number(row.stock_quantity ?? 0);
    const minimumStockQuantity = Number(row.minimum_stock_quantity ?? 0);

    totalStockUnits += stockQuantity;

    if (stockQuantity <= 0) {
      outOfStockProducts += 1;
    }

    if (stockQuantity <= minimumStockQuantity) {
      lowStockProducts += 1;
    }
  }

  return {
    totalProducts: rows.length,
    lowStockProducts,
    outOfStockProducts,
    totalStockUnits,
  };
}
