import type { CartItem } from "../../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function getCartItemByIdRecord(id: string): Promise<CartItem | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as CartItem | null);
}
