import type { Cart } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function finalizeCartCheckoutRecord(
  id: string,
): Promise<Cart | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("cart")
    .update({
      status: "checked_out",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "active")
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Cart | null);
}
