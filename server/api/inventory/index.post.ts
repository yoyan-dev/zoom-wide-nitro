import { defineEventHandler, readBody, setResponseStatus } from "h3";
import type { InventoryLog } from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createInventoryLogSchema } from "../../schemas";
import { badRequest, created, internalError } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsedBody = createInventoryLogSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const payload = {
    id: `inv-${Date.now()}`,
    product_id: parsedBody.data.product_id,
    movement_type: parsedBody.data.movement_type,
    quantity_change: parsedBody.data.quantity_change,
    reference_type: parsedBody.data.reference_type ?? null,
    reference_id: parsedBody.data.reference_id ?? null,
    note: parsedBody.data.note ?? null,
    created_by: parsedBody.data.created_by ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("inventory_logs")
    .insert(payload)
    .select("id, product_id, movement_type, quantity_change, reference_type, reference_id, note, created_by, created_at")
    .single();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  setResponseStatus(event, 201);
  return created(data as InventoryLog, {
    total: 1,
  });
});
