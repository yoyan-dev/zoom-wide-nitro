import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseStatus,
} from "h3";
import type { Supplier } from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { updateSupplierSchema } from "../../schemas";
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

  const body = await readBody(event);
  const parsedBody = updateSupplierSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const updates = Object.fromEntries(
    Object.entries({
      name: parsedBody.data.name,
      contact_name: parsedBody.data.contact_name,
      phone: parsedBody.data.phone,
      email: parsedBody.data.email,
      address: parsedBody.data.address,
    }).filter(([, value]) => value !== undefined),
  );

  const supabase = getSupabaseAdmin();

  if (Object.keys(updates).length === 0) {
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
  }

  const { data, error } = await supabase
    .from("suppliers")
    .update(updates)
    .eq("id", id)
    .select("*")
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
