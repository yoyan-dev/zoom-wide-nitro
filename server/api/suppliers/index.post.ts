import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createSupplierSchema } from "../../schemas";
import { badRequest, created, internalError } from "../../utils/response";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsedBody = createSupplierSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const payload = {
    name: parsedBody.data.name,
    contact_name: parsedBody.data.contact_name ?? null,
    phone: parsedBody.data.phone ?? null,
    email: parsedBody.data.email ?? null,
    address: parsedBody.data.address ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("suppliers")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  setResponseStatus(event, 201);
  return created(data || {}, {
    total: 1,
  });
});
