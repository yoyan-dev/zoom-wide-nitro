import type { InventoryLog, PaginatedResult } from "../../../types";
import { listInventoryMovementRecords } from "../../repositories/inventory/list-inventory-movements";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { mapInventoryLog } from "./map-inventory-log";
import { assertValidInventoryMovementType } from "./inventory-reporting";

export type ListInventoryMovementsParams = {
  q?: string;
  product_id?: string;
  movement_type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export async function listInventoryMovements(
  params: ListInventoryMovementsParams,
): Promise<PaginatedResult<InventoryLog[]>> {
  const movementType = assertValidInventoryMovementType(params.movement_type);

  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listInventoryMovementRecords({
    q: params.q,
    product_id: params.product_id,
    movement_type: movementType,
    from: params.from,
    to: params.to,
    rangeFrom: pagination.from,
    rangeTo: pagination.to,
  });

  return {
    data: result.data.map(mapInventoryLog),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
