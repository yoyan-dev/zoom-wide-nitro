import {
  defineEventHandler,
  readMultipartFormData,
  setResponseStatus,
} from "h3";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createProductSchema } from "../../schemas";
import {
  badRequest,
  created,
  internalError,
} from "../../utils/response";
import { parseProductMultipartFields } from "../../utils/resource-form-data";

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData) {
    setResponseStatus(event, 400);
    return badRequest("multipart/form-data is required for product creation");
  }

  let body: ReturnType<typeof parseProductMultipartFields>;

  try {
    body = parseProductMultipartFields(formData);
  } catch (error) {
    setResponseStatus(event, 400);
    return badRequest(
      error instanceof Error ? error.message : "Invalid product form data",
    );
  }

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

  const { data, error } = await supabase
    .from("products")
    .insert(insertPayload)
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
