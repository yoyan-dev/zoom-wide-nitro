import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { getSupabaseAdmin } from "../../lib/supabase";
import { badRequest, internalError, notFound, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    setResponseStatus(event, 400);
    return badRequest("Warehouse id is required");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("warehouses")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  if (!data) {
    setResponseStatus(event, 404);
    return notFound("Warehouse not found");
  }

  return ok(null, {
    total: 1,
    message: "Warehouse deleted",
  });
});
