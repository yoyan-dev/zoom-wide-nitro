import type { InventoryStockItem, PaginatedResult } from "../../../types";
import { listStockViewRecords } from "../../repositories/inventory/list-stock-view";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { assertValidInventoryStockStatus } from "./inventory-reporting";
import { mapStockViewItem } from "./map-stock-view-item";

export type GetStockViewParams = {
  q?: string;
  product_id?: string;
  stock_status?: string;
  page?: number;
  limit?: number;
};

export async function getStockView(
  params: GetStockViewParams,
): Promise<PaginatedResult<InventoryStockItem[]>> {
  const stockStatus = assertValidInventoryStockStatus(params.stock_status);
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  if (!stockStatus) {
    const result = await listStockViewRecords({
      q: params.q,
      product_id: params.product_id,
      rangeFrom: pagination.from,
      rangeTo: pagination.to,
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

  const result = await listStockViewRecords({
    q: params.q,
    product_id: params.product_id,
  });
  const filteredData = result.data
    .map(mapStockViewItem)
    .filter((item) => {
      if (stockStatus === "out_of_stock") {
        return item.stock_quantity <= 0;
      }

      return item.is_low_stock;
    });
  const paginatedData = filteredData.slice(pagination.from, pagination.to + 1);

  return {
    data: paginatedData,
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: filteredData.length,
    }),
  };
}
