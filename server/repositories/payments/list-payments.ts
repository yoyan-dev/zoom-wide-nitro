import type { Payment } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyPaymentReportFilters,
  type PaymentReportFilters,
} from "./apply-payment-report-filters";
import { PAYMENT_SELECT } from "./payment-select";

export type ListPaymentRecordsParams = PaymentReportFilters & {
  rangeFrom: number;
  rangeTo: number;
};

export async function listPaymentRecords(
  params: ListPaymentRecordsParams,
): Promise<RepositoryListResult<Payment>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("payments")
    .select(PAYMENT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.rangeFrom, params.rangeTo);

  query = applyPaymentReportFilters(query, params);

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Payment[],
    count,
  });
}
