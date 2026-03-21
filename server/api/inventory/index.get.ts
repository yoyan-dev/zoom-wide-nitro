import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import { getSupabaseAdmin } from "../../lib/supabase";
import { inventoryQuerySchema } from "../../schemas";
import { getPagination } from "../../utils/pagination";
import { badRequest, internalError, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const parsedQuery = inventoryQuerySchema.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedQuery.error.message);
  }

  const { q, movement_type, product_id, page, limit } = parsedQuery.data;
  const { from, to } = getPagination({ page, limit });
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("inventory_logs")
    .select("*, product:product_id")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q)
    query = query.or(
      [`note.ilike.%${q}%`, `reference_id.ilike.%${q}%`].join(","),
    );

  if (movement_type) query = query.eq("movement_type", movement_type);
  if (product_id) query = query.eq("product_id", product_id);

  const { data, error, count } = await query;

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  return ok(data ?? [], {
    total: count ?? 0,
  });
});
