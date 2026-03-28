import type { InventoryLog } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyInventoryMovementReportFilters,
  type InventoryMovementReportFilters,
} from "./apply-inventory-movement-report-filters";
import { INVENTORY_LOG_SELECT } from "./inventory-log-select";

export type ListInventoryMovementRecordsParams =
  InventoryMovementReportFilters & {
    rangeFrom: number;
    rangeTo: number;
  };

export async function listInventoryMovementRecords(
  params: ListInventoryMovementRecordsParams,
): Promise<RepositoryListResult<InventoryLog>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("inventory_logs")
    .select(INVENTORY_LOG_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.rangeFrom, params.rangeTo);

  query = applyInventoryMovementReportFilters(query, params);

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as InventoryLog[],
    count,
  });
}
