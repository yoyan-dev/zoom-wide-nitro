import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { getSupabaseAdmin } from "../../lib/supabase";
import { badRequest, internalError, notFound, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    setResponseStatus(event, 400);
    return badRequest("Inventory id is required");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("inventory_logs")
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
    return notFound("Inventory log not found");
  }

  return ok(null, {
    total: 1,
    message: "Inventory log deleted",
  });
});
