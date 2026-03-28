import type {
  InventoryMovementSummary,
  InventoryMovementType,
} from "../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyInventoryMovementReportFilters,
  type InventoryMovementReportFilters,
} from "./apply-inventory-movement-report-filters";

function createMovementCounts(): Record<InventoryMovementType, number> {
  return {
    in: 0,
    out: 0,
    adjustment: 0,
  };
}

export async function getInventoryMovementSummaryRecord(
  filters: InventoryMovementReportFilters,
): Promise<InventoryMovementSummary> {
  const supabase = useRepositoryClient();
  let query = supabase
    .from("inventory_logs")
    .select("movement_type, quantity_change");

  query = applyInventoryMovementReportFilters(query, filters);

  const { data, error } = await query;

  ensureRepositorySuccess(error);

  const rows = (data ?? []) as Array<{
    movement_type: InventoryMovementType;
    quantity_change: number | null;
  }>;

  const countsByType = createMovementCounts();
  let totalInQuantity = 0;
  let totalOutQuantity = 0;
  let totalAdjustmentQuantity = 0;

  for (const row of rows) {
    const quantity = Number(row.quantity_change ?? 0);
    countsByType[row.movement_type] += 1;

    if (row.movement_type === "in") {
      totalInQuantity += quantity;
    } else if (row.movement_type === "out") {
      totalOutQuantity += quantity;
    } else {
      totalAdjustmentQuantity += quantity;
    }
  }

  return {
    totalMatchingMovements: rows.length,
    countsByType,
    totalInQuantity,
    totalOutQuantity,
    totalAdjustmentQuantity,
  };
}
