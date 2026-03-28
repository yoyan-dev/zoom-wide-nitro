import type { InventoryStockSummary } from "../../types";
import { getStockSummaryRecord } from "../../repositories/inventory/get-stock-summary";

export type GetStockSummaryParams = {
  q?: string;
  product_id?: string;
};

export async function getStockSummary(
  params: GetStockSummaryParams,
): Promise<InventoryStockSummary> {
  return getStockSummaryRecord({
    q: params.q,
    product_id: params.product_id,
  });
}
