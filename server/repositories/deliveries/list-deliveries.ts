import type { Delivery } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyDeliveryReportFilters,
  type DeliveryReportFilters,
} from "./apply-delivery-report-filters";
import { DELIVERY_SELECT } from "./delivery-select";

export type ListDeliveryRecordsParams = DeliveryReportFilters & {
  rangeFrom: number;
  rangeTo: number;
};

export async function listDeliveryRecords(
  params: ListDeliveryRecordsParams,
): Promise<RepositoryListResult<Delivery>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("deliveries")
    .select(DELIVERY_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.rangeFrom, params.rangeTo);

  query = applyDeliveryReportFilters(query, params);

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Delivery[],
    count,
  });
}
