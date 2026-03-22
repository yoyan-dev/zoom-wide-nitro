import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function clearCartItemsRecord(cartId: string): Promise<number> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId)
    .select("id");

  ensureRepositorySuccess(error);
  return data?.length ?? 0;
}
