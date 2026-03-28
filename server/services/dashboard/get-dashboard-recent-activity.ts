import type { DashboardRecentActivity } from "../../types";
import { getDashboardRecentActivityRecord } from "../../repositories/dashboard/get-dashboard-recent-activity";
import { normalizeReportLimit } from "../../utils/reporting";
import { mapDelivery } from "../deliveries/map-delivery";
import { mapInventoryLog } from "../inventory/map-inventory-log";
import { mapOrder } from "../orders/map-order";
import { mapPayment } from "../payments/map-payment";

type GetDashboardRecentActivityParams = {
  limit?: number;
};

export async function getDashboardRecentActivity(
  params: GetDashboardRecentActivityParams = {},
): Promise<DashboardRecentActivity> {
  const limit = normalizeReportLimit(params.limit);
  const result = await getDashboardRecentActivityRecord(limit);

  return {
    recentOrders: result.recentOrders.map(mapOrder),
    recentDeliveries: result.recentDeliveries.map(mapDelivery),
    recentInventoryMovements:
      result.recentInventoryMovements.map(mapInventoryLog),
    recentPayments: result.recentPayments.map(mapPayment),
  };
}
