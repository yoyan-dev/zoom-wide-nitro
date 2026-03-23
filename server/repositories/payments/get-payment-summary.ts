import type {
  PaymentMethod,
  PaymentReportSummary,
  PaymentStatus,
} from "../../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyPaymentReportFilters,
  type PaymentReportFilters,
} from "./apply-payment-report-filters";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

function createPaymentStatusSummary(): Record<PaymentStatus, number> {
  return {
    pending: 0,
    paid: 0,
    failed: 0,
    refunded: 0,
  };
}

export async function getPaymentSummaryRecord(
  filters: PaymentReportFilters,
): Promise<PaymentReportSummary> {
  const supabase = useRepositoryClient();
  let query = supabase
    .from("payments")
    .select("status, amount");

  query = applyPaymentReportFilters(query, filters);

  const { data, error } = await query;

  ensureRepositorySuccess(error);

  const rows = (data ?? []) as Array<{
    status: PaymentStatus;
    amount: number | null;
  }>;
  const countsByStatus = createPaymentStatusSummary();
  let totalPaidAmount = 0;

  for (const row of rows) {
    if (PAYMENT_STATUSES.includes(row.status)) {
      countsByStatus[row.status] += 1;
    }

    if (row.status === "paid") {
      totalPaidAmount += Number(row.amount ?? 0);
    }
  }

  return {
    totalMatchingPayments: rows.length,
    totalPaidAmount,
    pendingPaymentsCount: countsByStatus.pending,
    failedPaymentsCount: countsByStatus.failed,
    refundedPaymentsCount: countsByStatus.refunded,
    countsByStatus,
  };
}
