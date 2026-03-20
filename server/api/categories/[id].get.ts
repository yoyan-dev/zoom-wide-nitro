import {
  defineEventHandler,
  getRouterParam,
  setResponseStatus,
} from "h3";
import type { Category } from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { notFound, internalError, ok, badRequest } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    setResponseStatus(event, 400);
    return badRequest("Category id is required");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  if (!data) {
    setResponseStatus(event, 404);
    return notFound("Category not found");
  }

  return ok(
    {
      ...(data as Category),
      overview: data.overview ?? undefined,
    },
    {
    total: 1,
    },
  );
});
