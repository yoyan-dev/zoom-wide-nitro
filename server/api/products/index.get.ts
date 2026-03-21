import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import { getSupabaseAdmin } from "../../lib/supabase";
import { productQuerySchema } from "../../schemas";
import { getPagination } from "../../utils/pagination";
import { badRequest, internalError, ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const parsedQuery = productQuerySchema.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedQuery.error.message);
  }

  const { q, category_id, supplier_id, page, limit } = parsedQuery.data;
  const { from, to } = getPagination({ page, limit });
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("products")
    .select(
      "*,category:category_id, supplier:supplier_id, warehouse:warehouse_id",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q)
    query = query.or(
      [`name.ilike.%${q}%`, `description.ilike.%${q}%`].join(","),
    );

  if (category_id) query = query.eq("category_id", category_id);

  if (supplier_id) query = query.eq("supplier_id", supplier_id);

  const { data, error, count } = await query;

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }
  return ok(data ?? [], {
    total: count ?? 0,
  });
});
