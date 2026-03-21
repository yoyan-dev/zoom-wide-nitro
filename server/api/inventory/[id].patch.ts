import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseStatus,
} from "h3";
import type { InventoryLog } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { updateInventoryLogSchema } from "../../schemas";
import { badRequest, internalError, notFound, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    setResponseStatus(event, 400);
    return badRequest("Inventory id is required");
  }

  const body = await readBody(event);
  const parsedBody = updateInventoryLogSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const updates = Object.fromEntries(
    Object.entries({
      product_id: parsedBody.data.product_id,
      movement_type: parsedBody.data.movement_type,
      quantity_change: parsedBody.data.quantity_change,
      reference_type: parsedBody.data.reference_type,
      reference_id: parsedBody.data.reference_id,
      note: parsedBody.data.note,
      created_by: parsedBody.data.created_by,
    }).filter(([, value]) => value !== undefined),
  );

  const supabase = getSupabaseAdmin();

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("inventory_logs")
      .update(updates)
      .eq("id", id);

    if (error) {
      setResponseStatus(event, 500);
      return internalError(error.message);
    }
  }

  const { data, error } = await supabase
    .from("inventory_logs")
    .select("id, product_id, movement_type, quantity_change, reference_type, reference_id, note, created_by, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  if (!data) {
    setResponseStatus(event, 404);
    return notFound("Inventory log not found");
  }

  return ok(data as InventoryLog, {
    total: 1,
  });
});
