import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Supplier,
  SupplierInsert,
  SupplierUpdate,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export async function listSuppliers(
  supabase: SupabaseClient<Database>
): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });
  assertSupabaseSuccess(error, "Failed to fetch suppliers.");

  return data ?? [];
}

export async function getSupplierById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch supplier.");

  return data ?? null;
}

export async function createSupplier(
  supabase: SupabaseClient<Database>,
  payload: SupplierInsert
): Promise<Supplier> {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create supplier.");

  return data;
}

export async function updateSupplier(
  supabase: SupabaseClient<Database>,
  id: string,
  payload: SupplierUpdate
): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from("suppliers")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to update supplier.");

  return data ?? null;
}
