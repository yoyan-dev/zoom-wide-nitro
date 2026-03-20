import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import type {
  Category,
  Product,
  Supplier,
  Warehouse,
} from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { badRequest, internalError, notFound, ok } from "../../utils/response";

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
  const id = getRouterParam(event, "id");

  if (!id) {
    setResponseStatus(event, 400);
    return badRequest("Product id is required");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    setResponseStatus(event, 500);
    return internalError(error.message);
  }

  if (!data) {
    setResponseStatus(event, 404);
    return notFound("Product not found");
  }

  const [categoryResult, supplierResult, warehouseResult] = await Promise.all([
    supabase.from("categories").select("*").eq("id", data.category_id).maybeSingle(),
    data.supplier_id
      ? supabase.from("suppliers").select("*").eq("id", data.supplier_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    data.warehouse_id
      ? supabase.from("warehouses").select("*").eq("id", data.warehouse_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

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
    ...data,
    handbook: data.handbook ?? undefined,
    category: categoryResult.data ? mapCategory(categoryResult.data) : undefined,
    supplier: supplierResult.data ? mapSupplier(supplierResult.data) : undefined,
    warehouse: warehouseResult.data ? mapWarehouse(warehouseResult.data) : undefined,
  };

  return ok(product, {
    total: 1,
  });
});
