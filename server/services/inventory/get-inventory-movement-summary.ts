import type { InventoryMovementSummary } from "../../types";
import { getInventoryMovementSummaryRecord } from "../../repositories/inventory/get-inventory-movement-summary";
import { assertValidInventoryMovementType } from "./inventory-reporting";

export type GetInventoryMovementSummaryParams = {
  q?: string;
  product_id?: string;
  movement_type?: string;
  from?: string;
  to?: string;
};

export async function getInventoryMovementSummary(
  params: GetInventoryMovementSummaryParams,
): Promise<InventoryMovementSummary> {
  const movementType = assertValidInventoryMovementType(params.movement_type);

  return getInventoryMovementSummaryRecord({
    q: params.q,
    product_id: params.product_id,
    movement_type: movementType,
    from: params.from,
    to: params.to,
  });
}
