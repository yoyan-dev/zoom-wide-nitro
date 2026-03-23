import { defineEventHandler, setResponseStatus } from "h3";
import { getSupabaseAdmin } from "../lib/supabase";
import { badRequest, internalError, ok } from "../utils/response";

export default defineEventHandler(async (event) => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("health").select("*");

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  if (!data) {
    setResponseStatus(event, 404);
    return badRequest("Health check failed");
  }

  return ok(data, {
    total: 1,
  });
});
