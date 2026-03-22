import type { Cart, CartItem } from "../../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { CART_DETAIL_SELECT } from "./cart-select";

export type CartRecord = Cart & {
  items?: CartItem[];
};

export async function getActiveCartByCustomerIdRecord(
  customerId: string,
): Promise<CartRecord | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("cart")
    .select(CART_DETAIL_SELECT)
    .eq("customer_id", customerId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as CartRecord | null);
}
