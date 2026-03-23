import type { OrderStatus } from "../../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyOrderReportFilters,
  type OrderReportFilters,
} from "./apply-order-report-filters";

export type OrderSummaryRecord = {
  totalMatchingOrders: number;
  totalSalesAmount: number;
  countsByStatus: Record<OrderStatus, number>;
};

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
];

function createOrderStatusSummary(): Record<OrderStatus, number> {
  return {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  };
}

export async function getOrderSummaryRecord(
  filters: OrderReportFilters,
): Promise<OrderSummaryRecord> {
  const supabase = useRepositoryClient();

  const baseQuery = applyOrderReportFilters(
    supabase.from("orders").select("status, total_amount"),
    filters,
  );

  const { data, error } = await baseQuery;

  ensureRepositorySuccess(error);

  const rows = (data ?? []) as Array<{
    status: OrderStatus;
    total_amount: number | null;
  }>;

  const countsByStatus = createOrderStatusSummary();

  for (const status of ORDER_STATUSES) {
    countsByStatus[status] = 0;
  }

  let totalSalesAmount = 0;

  for (const row of rows) {
    if (ORDER_STATUSES.includes(row.status)) {
      countsByStatus[row.status] += 1;
    }

    totalSalesAmount += Number(row.total_amount ?? 0);
  }

  return {
    totalMatchingOrders: rows.length,
    totalSalesAmount,
    countsByStatus,
  };
}
