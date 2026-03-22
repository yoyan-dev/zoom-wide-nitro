import type { OrderItem } from "../../../types";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function getOrderItemsByOrderIdRecord(
  orderId: string,
): Promise<OrderItem[]> {
  const supabase = useRepositoryClient();
  const { data, error, count } = await supabase
    .from("order_items")
    .select("*", { count: "exact" })
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as OrderItem[],
    count,
  }).data;
}
