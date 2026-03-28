import type { DeliveryReportSummary, DeliveryStatus } from "../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyDeliveryReportFilters,
  type DeliveryReportFilters,
} from "./apply-delivery-report-filters";

const DELIVERY_STATUSES: DeliveryStatus[] = [
  "scheduled",
  "in_transit",
  "delivered",
  "failed",
  "cancelled",
];

function createDeliveryStatusSummary(): Record<DeliveryStatus, number> {
  return {
    scheduled: 0,
    in_transit: 0,
    delivered: 0,
    failed: 0,
    cancelled: 0,
  };
}

export async function getDeliverySummaryRecord(
  filters: DeliveryReportFilters,
): Promise<DeliveryReportSummary> {
  const supabase = useRepositoryClient();
  const query = applyDeliveryReportFilters(
    supabase.from("deliveries").select("status"),
    filters,
  );

  const { data, error } = await query;

  ensureRepositorySuccess(error);

  const rows = (data ?? []) as Array<{ status: DeliveryStatus }>;
  const countsByStatus = createDeliveryStatusSummary();

  for (const row of rows) {
    if (DELIVERY_STATUSES.includes(row.status)) {
      countsByStatus[row.status] += 1;
    }
  }

  return {
    totalMatchingDeliveries: rows.length,
    failedDeliveriesCount: countsByStatus.failed,
    countsByStatus,
  };
}
