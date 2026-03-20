import { defineEventHandler, getQuery, setResponseStatus } from "h3";
import type {
  Category,
  Product,
  Supplier,
  Warehouse,
} from "../../../shared/types";
import { getSupabaseAdmin } from "../../lib/supabase";
import { productQuerySchema } from "../../schemas";
import { getPagination } from "../../utils/pagination";
import { badRequest, internalError, ok } from "../../utils/response";

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

function mapProduct(
  row: any,
  categoryMap: Map<string, Category>,
  supplierMap: Map<string, Supplier>,
  warehouseMap: Map<string, Warehouse>,
): Product {
  return {
    ...row,
    handbook: row.handbook ?? undefined,
    category: row.category_id ? categoryMap.get(row.category_id) : undefined,
    supplier: row.supplier_id ? supplierMap.get(row.supplier_id) : undefined,
    warehouse: row.warehouse_id ? warehouseMap.get(row.warehouse_id) : undefined,
  };
}

export default defineEventHandler(async (event) => {
  const parsedQuery = productQuerySchema.safeParse(getQuery(event));

  if (!parsedQuery.success) {
    setResponseStatus(event, 400);
    return badRequest(parsedQuery.error.message);
  }

  const { q, category_id, supplier_id, page, limit } = parsedQuery.data;
  const { from, to } = getPagination({ page, limit });
  const supabase = getSupabaseAdmin();

  const [
    productsResult,
    categoriesResult,
    suppliersResult,
    warehousesResult,
  ] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*"),
    supabase.from("suppliers").select("*"),
    supabase.from("warehouses").select("*"),
  ]);

  if (productsResult.error) {
    setResponseStatus(event, 500);
    return internalError(productsResult.error.message);
  }

  if (categoriesResult.error) {
    setResponseStatus(event, 500);
    return internalError(categoriesResult.error.message);
  }

  if (suppliersResult.error) {
    setResponseStatus(event, 500);
    return internalError(suppliersResult.error.message);
  }

  if (warehousesResult.error) {
    setResponseStatus(event, 500);
    return internalError(warehousesResult.error.message);
  }

  const categoryMap = new Map(
    (categoriesResult.data ?? []).map((item) => [item.id, mapCategory(item)]),
  );
  const supplierMap = new Map(
    (suppliersResult.data ?? []).map((item) => [item.id, mapSupplier(item)]),
  );
  const warehouseMap = new Map(
    (warehousesResult.data ?? []).map((item) => [item.id, mapWarehouse(item)]),
  );

  let products = (productsResult.data ?? []).map((item) =>
    mapProduct(item, categoryMap, supplierMap, warehouseMap),
  );

  if (category_id) {
    products = products.filter((product) => product.category_id === category_id);
  }

  if (supplier_id) {
    products = products.filter((product) => product.supplier_id === supplier_id);
  }

  if (q) {
    const term = q.trim().toLowerCase();
    products = products.filter((product) =>
      [
        product.name ?? "",
        product.sku ?? "",
        product.supplier?.name ?? "",
        product.warehouse?.name ?? "",
        product.description ?? "",
        product.handbook?.summary ?? "",
        ...(product.handbook?.features ?? []),
        ...(product.handbook?.applications ?? []),
        ...((product.handbook?.specifications ?? []).flatMap((item) => [
          item.label,
          item.value,
        ])),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }

  return ok(products.slice(from, to + 1), {
    total: products.length,
  });
});
