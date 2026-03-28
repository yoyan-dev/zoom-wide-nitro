import type { z } from "zod";
import type { Order } from "../../types";
import { updateOrderSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { ORDER_DETAIL_SELECT } from "./order-select";

type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

export async function updateOrderRecord(
  id: string,
  input: UpdateOrderInput,
): Promise<Order | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      customer_id: input.customer_id,
      status: input.status,
      total_amount: input.total_amount,
      notes: input.notes,
      approved_by: input.approved_by,
      rejection_reason: input.rejection_reason,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select(ORDER_DETAIL_SELECT)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Order | null);
}
