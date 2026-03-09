import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  InventoryLog,
  InventoryLogInsert,
  Product,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export interface ProductStockView {
  id: string;
  sku: string;
  name: string;
  stock_quantity: number;
  minimum_stock_quantity: number;
  unit: string;
  is_active: boolean;
}

export async function listProductStock(
  supabase: SupabaseClient<Database>
): Promise<ProductStockView[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, name, stock_quantity, minimum_stock_quantity, unit, is_active")
    .order("name", { ascending: true });
  assertSupabaseSuccess(error, "Failed to fetch stock.");

  return (data ?? []) as ProductStockView[];
}

export async function getProductForStockUpdate(
  supabase: SupabaseClient<Database>,
  productId: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch product for stock update.");

  return data ?? null;
}

export async function updateProductStock(
  supabase: SupabaseClient<Database>,
  productId: string,
  stockQuantity: number
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .update({
      stock_quantity: stockQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("*")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to update product stock.");

  return data ?? null;
}

export async function createInventoryLog(
  supabase: SupabaseClient<Database>,
  payload: InventoryLogInsert
): Promise<InventoryLog> {
  const { data, error } = await supabase
    .from("inventory_logs")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create inventory log.");

  return data;
}
