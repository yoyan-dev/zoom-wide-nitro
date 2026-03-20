import { defineEventHandler, readBody, setResponseStatus } from "h3";
import type {
  Category,
  Product,
  Supplier,
  Warehouse,
} from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { createProductSchema } from "../../schemas";
import { badRequest, created, internalError, notFound } from "../../utils/response";

function mapCategory(row: any): Category {
  return {
    ...row,
    overview: row.overview ?? undefined,
  };
}

function mapSupplier(row: any): Supplier {
  return {
    ...row,
    contact_name: row.contact_name ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
  };
}

function mapWarehouse(row: any): Warehouse {
  return row as Warehouse;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parsedBody = createProductSchema.safeParse(body);

  if (!parsedBody.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedBody.error.message);
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const productId = `prod-${Date.now()}`;

  const insertPayload = {
    id: productId,
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

  const [
    productResult,
    categoryResult,
    supplierResult,
    warehouseResult,
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", productId).maybeSingle(),
    supabase
      .from("categories")
      .select("*")
      .eq("id", parsedBody.data.category_id)
      .maybeSingle(),
    parsedBody.data.supplier_id
      ? supabase
          .from("suppliers")
          .select("*")
          .eq("id", parsedBody.data.supplier_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    parsedBody.data.warehouse_id
      ? supabase
          .from("warehouses")
          .select("*")
          .eq("id", parsedBody.data.warehouse_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (productResult.error) {
    setResponseStatus(event, 500);
    return internalError(productResult.error.message);
  }

  if (!productResult.data) {
    setResponseStatus(event, 404);
    return notFound("Product not found after creation");
  }

  if (categoryResult.error) {
    setResponseStatus(event, 500);
    return internalError(categoryResult.error.message);
  }

  if (supplierResult.error) {
    setResponseStatus(event, 500);
    return internalError(supplierResult.error.message);
  }

  if (warehouseResult.error) {
    setResponseStatus(event, 500);
    return internalError(warehouseResult.error.message);
  }

  const product: Product = {
    ...productResult.data,
    handbook: productResult.data.handbook ?? undefined,
    category: categoryResult.data ? mapCategory(categoryResult.data) : undefined,
    supplier: supplierResult.data ? mapSupplier(supplierResult.data) : undefined,
    warehouse: warehouseResult.data ? mapWarehouse(warehouseResult.data) : undefined,
  };

  setResponseStatus(event, 201);
  return created(product, {
    total: 1,
  });
});
