import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Payment,
  PaymentInsert,
  PaymentUpdate,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export async function listPaymentsByOrderId(
  supabase: SupabaseClient<Database>,
  orderId: string
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  assertSupabaseSuccess(error, "Failed to fetch payments.");

  return data ?? [];
}

export async function createPayment(
  supabase: SupabaseClient<Database>,
  payload: PaymentInsert
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to record payment.");

  return data;
}

export async function updatePayment(
  supabase: SupabaseClient<Database>,
  paymentId: string,
  payload: PaymentUpdate
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from("payments")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select("*")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to update payment.");

  return data ?? null;
}
