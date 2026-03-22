import type { z } from "zod";
import type { CartItem } from "../../../types";
import { updateCartItemSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export async function updateCartItemRecord(
  id: string,
  input: UpdateCartItemInput,
): Promise<CartItem | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      quantity: input.quantity,
      unit_price: input.unit_price,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("cart_items")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as CartItem | null);
}
