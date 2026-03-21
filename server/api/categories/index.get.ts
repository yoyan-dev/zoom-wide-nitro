import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import type { Category } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { categoryQuerySchema } from "../../schemas";
import { getPagination } from "../../utils/pagination";
import { badRequest, internalError, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const parsedQuery = categoryQuerySchema.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedQuery.error.message);
  }

  const { q, page, limit } = parsedQuery.data;
  const { from, to } = getPagination({ page, limit });
  const supabase = getSupabaseAdmin();
  const mapCategory = (row: any): Category => ({
    ...row,
    overview: row.overview ?? undefined,
  });

  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) query = query.or("name.ilike.*" + q + "*");

  const { data, error, count } = await query;

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  return ok((data ?? []).map(mapCategory), {
    total: count ?? 0,
  });
});
