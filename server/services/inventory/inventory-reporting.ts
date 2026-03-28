import type { H3Event } from "h3";
import type { InventoryMovementType, InventoryStockStatus } from "../../types";
import { badRequestError } from "../../utils/errors";
import { requirePermission } from "../../utils/permissions";

export const INVENTORY_MOVEMENT_REPORT_TYPES = [
  "in",
  "out",
  "adjustment",
] as const satisfies readonly InventoryMovementType[];

export const INVENTORY_STOCK_STATUSES = [
  "low_stock",
  "out_of_stock",
] as const satisfies readonly InventoryStockStatus[];

const INVENTORY_STOCK_STATUS_SET = new Set<string>(INVENTORY_STOCK_STATUSES);
const INVENTORY_MOVEMENT_TYPE_SET = new Set<string>(
  INVENTORY_MOVEMENT_REPORT_TYPES,
);

export function assertValidInventoryMovementType(
  movementType?: string,
): InventoryMovementType | undefined {
  if (!movementType) {
    return undefined;
  }

  if (!INVENTORY_MOVEMENT_TYPE_SET.has(movementType)) {
    throw badRequestError(
      "movement_type must be a valid inventory movement type",
    );
  }

  return movementType as InventoryMovementType;
}

export function assertValidInventoryStockStatus(
  stockStatus?: string,
): InventoryStockStatus | undefined {
  if (!stockStatus) {
    return undefined;
  }

  if (!INVENTORY_STOCK_STATUS_SET.has(stockStatus)) {
    throw badRequestError(
      "stock_status must be a valid inventory stock status",
    );
  }

  return stockStatus as InventoryStockStatus;
}

export function requireInventoryReportAccess(event: H3Event): void {
  requirePermission(event, "inventory:report");
}
