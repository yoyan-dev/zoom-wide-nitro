import type { Order } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyOrderReportFilters,
  type OrderReportFilters,
} from "./apply-order-report-filters";
import { ORDER_DETAIL_SELECT } from "./order-select";

export type ListOrderRecordsParams = OrderReportFilters & {
  rangeFrom: number;
  rangeTo: number;
};

export async function listOrderRecords(
  params: ListOrderRecordsParams,
): Promise<RepositoryListResult<Order>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.rangeFrom, params.rangeTo);

  query = applyOrderReportFilters(query, params);

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Order[],
    count,
  });
}
