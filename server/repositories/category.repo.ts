import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Category,
  CategoryInsert,
  CategoryUpdate,
  Database,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export async function listCategories(
  supabase: SupabaseClient<Database>
): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  assertSupabaseSuccess(error, "Failed to fetch categories.");

  return data ?? [];
}

export async function getCategoryById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch category.");

  return data ?? null;
}

export async function createCategory(
  supabase: SupabaseClient<Database>,
  payload: CategoryInsert
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create category.");

  return data;
}

export async function updateCategory(
  supabase: SupabaseClient<Database>,
  id: string,
  payload: CategoryUpdate
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to update category.");

  return data ?? null;
}

export async function deleteCategory(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  assertSupabaseSuccess(error, "Failed to delete category.");
}
