import type { z } from "zod";
import type { CartItem } from "../../types";
import { createCartItemSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateCartItemInput = z.infer<typeof createCartItemSchema>;

export async function createCartItemRecord(
  input: CreateCartItemInput,
): Promise<CartItem> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    cart_id: input.cart_id,
    product_id: input.product_id,
    quantity: input.quantity,
    unit_price: input.unit_price,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("cart_items")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);
  return (data ?? {}) as CartItem;
}
