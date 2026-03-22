import type { Delivery } from "../../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DELIVERY_SELECT } from "./delivery-select";

export async function getDeliveryByOrderIdRecord(
  orderId: string,
): Promise<Delivery | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("deliveries")
    .select(DELIVERY_SELECT)
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Delivery | null);
}
