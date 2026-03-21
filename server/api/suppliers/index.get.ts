import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import type { Supplier } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { supplierQuerySchema } from "../../schemas";
import { getPagination } from "../../utils/pagination";
import { badRequest, internalError, ok } from "../../utils/response";

function mapSupplier(row: any): Supplier {
  return {
    ...row,
    contact_name: row.contact_name ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
  };
}

export default defineEventHandler(async (event) => {
  const parsedQuery = supplierQuerySchema.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedQuery.error.message);
  }

  const { q, page, limit } = parsedQuery.data;
  const { from, to } = getPagination({ page, limit });
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("suppliers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(
      [
        `id.ilike.%${q}%`,
        `name.ilike.%${q}%`,
        `contact_name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `address.ilike.%${q}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  return ok((data ?? []).map(mapSupplier), {
    total: count ?? 0,
  });
});
