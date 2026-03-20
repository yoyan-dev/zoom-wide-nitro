import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseStatus,
} from "h3";
import type { Warehouse } from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { updateWarehouseSchema } from "../../schemas";
import { badRequest, internalError, notFound, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    setResponseStatus(event, 400);
    return badRequest("Warehouse id is required");
  }

  const body = await readBody(event);
  const parsedBody = updateWarehouseSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const updates = Object.fromEntries(
    Object.entries({
      name: parsedBody.data.name,
      address: parsedBody.data.address,
      manager_id: parsedBody.data.manager_id,
      capacity: parsedBody.data.capacity,
      status: parsedBody.data.status,
    }).filter(([, value]) => value !== undefined),
  );

  const supabase = getSupabaseAdmin();

  if (Object.keys(updates).length === 0) {
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      setResponseStatus(event, 500);
      return internalError(error.message);
    }

    if (!data) {
      setResponseStatus(event, 404);
      return notFound("Warehouse not found");
    }

    return ok(data as Warehouse, {
      total: 1,
    });
  }

  const { data, error } = await supabase
    .from("warehouses")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  if (!data) {
    setResponseStatus(event, 404);
    return notFound("Warehouse not found");
  }

  return ok(data as Warehouse, {
    total: 1,
  });
});
