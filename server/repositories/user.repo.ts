import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, User, UserInsert } from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export async function findUserById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch user profile.");

  return data ?? null;
}

export async function createUser(
  supabase: SupabaseClient<Database>,
  payload: UserInsert
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create user profile.");

  return data;
}
