import type { Delivery } from "../../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DELIVERY_SELECT } from "./delivery-select";

export type ListDeliveryRecordsParams = {
  q?: string;
  status?: string;
  order_id?: string;
  driver_id?: string;
  from: number;
  to: number;
};

export async function listDeliveryRecords(
  params: ListDeliveryRecordsParams,
): Promise<RepositoryListResult<Delivery>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("deliveries")
    .select(DELIVERY_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.ilike("vehicle_number", `%${params.q}%`);
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.order_id) {
    query = query.eq("order_id", params.order_id);
  }

  if (params.driver_id) {
    query = query.eq("driver_id", params.driver_id);
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Delivery[],
    count,
  });
}
