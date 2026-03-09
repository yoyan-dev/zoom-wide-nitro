import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Customer,
  CustomerInsert,
  Database,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export async function listCustomers(
  supabase: SupabaseClient<Database>
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  assertSupabaseSuccess(error, "Failed to fetch customers.");

  return data ?? [];
}

export async function getCustomerById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch customer.");

  return data ?? null;
}

export async function getCustomerByUserId(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch customer by user id.");

  return data ?? null;
}

export async function createCustomer(
  supabase: SupabaseClient<Database>,
  payload: CustomerInsert
): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create customer.");

  return data;
}
