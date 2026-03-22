import {
  defineEventHandler,
  readMultipartFormData,
  setResponseStatus,
} from "h3";
import type { InventoryLog } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createInventoryLogSchema } from "../../schemas";
import { badRequest, created, internalError } from "../../utils/response";
import { parseInventoryMultipartFields } from "../../utils/resource-form-data";

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData) {
    setResponseStatus(event, 400);
    return badRequest("multipart/form-data is required for inventory creation");
  }

  let body: ReturnType<typeof parseInventoryMultipartFields>;

  try {
    body = parseInventoryMultipartFields(formData);
  } catch (error) {
    setResponseStatus(event, 400);
    return badRequest(
      error instanceof Error ? error.message : "Invalid inventory form data",
    );
  }

  const parsedBody = createInventoryLogSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const supabase = getSupabaseAdmin();

  const payload = {
    product_id: parsedBody.data.product_id,
    movement_type: parsedBody.data.movement_type,
    quantity_change: parsedBody.data.quantity_change,
    reference_type: parsedBody.data.reference_type ?? null,
    reference_id: parsedBody.data.reference_id ?? null,
    note: parsedBody.data.note ?? null,
    created_by: parsedBody.data.created_by ?? null,
  };

  const { data, error } = await supabase
    .from("inventory_logs")
    .insert(payload)
    .select(
      "id, product_id, movement_type, quantity_change, reference_type, reference_id, note, created_by, created_at",
    )
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
