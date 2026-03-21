import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import type { Warehouse } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { warehouseQuerySchema } from "../../schemas";
import { getPagination } from "../../utils/pagination";
import { badRequest, internalError, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const parsedQuery = warehouseQuerySchema.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedQuery.error.message);
  }

  const { q, status, page, limit } = parsedQuery.data;
  const { from, to } = getPagination({ page, limit });
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("warehouses")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(
      [
        `id.ilike.%${q}%`,
        `name.ilike.%${q}%`,
        `address.ilike.%${q}%`,
      ].join(","),
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  return ok((data ?? []) as Warehouse[], {
    total: count ?? 0,
  });
});
