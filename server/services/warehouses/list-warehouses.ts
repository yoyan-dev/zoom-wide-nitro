import type { PaginatedResult, Warehouse } from "../../../types";
import { listWarehouseRecords } from "../../repositories/warehouses/list-warehouses";
import { getPagination, getPaginationMeta } from "../../utils/pagination";

export type ListWarehousesParams = {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export async function listWarehouses(
  params: ListWarehousesParams,
): Promise<PaginatedResult<Warehouse[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listWarehouseRecords({
    q: params.q,
    status: params.status,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data,
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
