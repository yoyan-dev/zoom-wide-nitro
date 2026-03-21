import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import type { Supplier } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { badRequest, internalError, notFound, ok } from "../../utils/response";

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
  const id = getRouterParam(event, "id");

  if (!id) {
    setResponseStatus(event, 400);
    return badRequest("Supplier id is required");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  if (!data) {
    setResponseStatus(event, 404);
    return notFound("Supplier not found");
  }

  return ok(mapSupplier(data), {
    total: 1,
  });
});
