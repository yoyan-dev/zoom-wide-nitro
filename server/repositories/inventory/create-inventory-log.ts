import type { z } from "zod";
import type { InventoryLog } from "../../../types";
import { createInventoryLogSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateInventoryLogInput = z.infer<typeof createInventoryLogSchema>;

export async function createInventoryLogRecord(
  input: CreateInventoryLogInput,
): Promise<InventoryLog> {
  const supabase = useRepositoryClient();

  const payload = {
    product_id: input.product_id,
    movement_type: input.movement_type,
    quantity_change: input.quantity_change,
    reference_type: input.reference_type ?? null,
    reference_id: input.reference_id ?? null,
    note: input.note ?? null,
    created_by: input.created_by ?? null,
  };

  const { data, error } = await supabase
    .from("inventory_logs")
    .insert(payload)
    .select(
      "id, product_id, movement_type, quantity_change, reference_type, reference_id, note, created_by, created_at",
    )
    .single();

  ensureRepositorySuccess(error);

  return data as InventoryLog;
}
