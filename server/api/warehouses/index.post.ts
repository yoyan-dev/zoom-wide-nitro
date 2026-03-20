import { defineEventHandler, readBody, setResponseStatus } from "h3";
import type { Warehouse } from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createWarehouseSchema } from "../../schemas";
import { badRequest, created, internalError } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsedBody = createWarehouseSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const payload = {
    id: `wh-${Date.now()}`,
    name: parsedBody.data.name,
    address: parsedBody.data.address,
    manager_id: parsedBody.data.manager_id ?? null,
    capacity: parsedBody.data.capacity,
    status: parsedBody.data.status,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("warehouses")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  setResponseStatus(event, 201);
  return created(data as Warehouse, {
    total: 1,
  });
});
