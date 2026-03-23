import type { CartItem } from "../../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function getCartItemByProductRecord(
  cartId: string,
  productId: string,
): Promise<CartItem | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as CartItem | null);
}
