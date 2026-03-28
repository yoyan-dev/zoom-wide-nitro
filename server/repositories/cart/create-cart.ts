import type { Cart } from "../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { CART_DETAIL_SELECT } from "./cart-select";
import type { CartRecord } from "./get-active-cart-by-customer-id";

export async function createCartRecord(
  customerId: string,
): Promise<CartRecord> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload: Partial<Cart> = {
    customer_id: customerId,
    status: "active",
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("cart")
    .insert(payload)
    .select(CART_DETAIL_SELECT)
    .single();

  ensureRepositorySuccess(error);
  return (data ?? {}) as CartRecord;
}
