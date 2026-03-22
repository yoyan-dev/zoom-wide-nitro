import type { InventoryStockItem, PaginatedResult } from "../../../types";
import { listStockViewRecords } from "../../repositories/inventory/list-stock-view";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { mapStockViewItem } from "./map-stock-view-item";

export type GetStockViewParams = {
  q?: string;
  product_id?: string;
  page?: number;
  limit?: number;
};

export async function getStockView(
  params: GetStockViewParams,
): Promise<PaginatedResult<InventoryStockItem[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listStockViewRecords({
    q: params.q,
    product_id: params.product_id,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data.map(mapStockViewItem),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
