import type { z } from "zod";
import type { Cart } from "../../types";
import { updateCartSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type UpdateCartInput = z.infer<typeof updateCartSchema>;

export async function updateCartRecord(
  id: string,
  input: UpdateCartInput,
): Promise<Cart | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      customer_id: input.customer_id,
      status: input.status,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("cart")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Cart | null);
}
