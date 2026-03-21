import { defineEventHandler, readBody, setResponseStatus } from "h3";
import type { Product } from "../../../types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createProductSchema } from "../../schemas";
import {
  badRequest,
  created,
  internalError,
  notFound,
} from "../../utils/response";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsedBody = createProductSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const insertPayload = {
    category_id: parsedBody.data.category_id,
    supplier_id: parsedBody.data.supplier_id ?? null,
    warehouse_id: parsedBody.data.warehouse_id ?? null,
    sku: parsedBody.data.sku,
    name: parsedBody.data.name,
    description: parsedBody.data.description ?? null,
    image_url: parsedBody.data.image_url ?? null,
    unit: parsedBody.data.unit,
    price: parsedBody.data.price,
    stock_quantity: parsedBody.data.stock_quantity,
    minimum_stock_quantity: parsedBody.data.minimum_stock_quantity,
    handbook: parsedBody.data.handbook ?? null,
    is_active: parsedBody.data.is_active,
    created_at: now,
    updated_at: now,
  };

  const { error: insertError } = await supabase
    .from("products")
    .insert(insertPayload);

  if (insertError) {
    setResponseStatus(event, 500);
    return internalError(insertError.message);
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "*, category:category_id, supplier:supplier_id, warehouse:warehouse_id",
    )
    .eq("id", body.id)
    .maybeSingle();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  setResponseStatus(event, 201);
  return created(data || {}, {
    total: 1,
  });
});
