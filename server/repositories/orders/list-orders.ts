import type { Order } from "../../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { ORDER_DETAIL_SELECT } from "./order-select";

export type ListOrderRecordsParams = {
  q?: string;
  status?: string;
  customer_id?: string;
  from: number;
  to: number;
};

export async function listOrderRecords(
  params: ListOrderRecordsParams,
): Promise<RepositoryListResult<Order>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [`id.ilike.%${params.q}%`, `notes.ilike.%${params.q}%`].join(","),
    );
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.customer_id) {
    query = query.eq("customer_id", params.customer_id);
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Order[],
    count,
  });
}
