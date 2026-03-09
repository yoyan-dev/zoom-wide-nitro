import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Product,
  ProductInsert,
  ProductUpdate,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export interface ProductFilters {
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean;
  search?: string;
}

export async function listProducts(
  supabase: SupabaseClient<Database>,
  filters: ProductFilters = {}
): Promise<Product[]> {
  let query = supabase.from("products").select("*");

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.supplierId) {
    query = query.eq("supplier_id", filters.supplierId);
  }

  if (typeof filters.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query.order("name", { ascending: true });
  assertSupabaseSuccess(error, "Failed to fetch products.");

  return data ?? [];
}

export async function getProductById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch product.");

  return data ?? null;
}

export async function getProductsByIds(
  supabase: SupabaseClient<Database>,
  ids: string[]
): Promise<Product[]> {
  if (!ids.length) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);
  assertSupabaseSuccess(error, "Failed to fetch products.");

  return data ?? [];
}

export async function createProduct(
  supabase: SupabaseClient<Database>,
  payload: ProductInsert
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create product.");

  return data;
}

export async function updateProduct(
  supabase: SupabaseClient<Database>,
  id: string,
  payload: ProductUpdate
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to update product.");

  return data ?? null;
}

export async function deleteProduct(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  assertSupabaseSuccess(error, "Failed to delete product.");
}

export async function setProductStock(
  supabase: SupabaseClient<Database>,
  id: string,
  stockQuantity: number
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .update({
      stock_quantity: stockQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to update product stock.");

  return data ?? null;
}
