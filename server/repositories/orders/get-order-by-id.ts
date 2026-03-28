import type { Order } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { ORDER_DETAIL_SELECT } from "./order-select";

export async function getOrderByIdRecord(id: string): Promise<Order | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Order | null);
}
