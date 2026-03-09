import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Delivery,
  DeliveryInsert,
  DeliveryUpdate,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export async function listDeliveries(
  supabase: SupabaseClient<Database>
): Promise<Delivery[]> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .order("created_at", { ascending: false });
  assertSupabaseSuccess(error, "Failed to fetch deliveries.");

  return data ?? [];
}

export async function getDeliveryById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch delivery.");

  return data ?? null;
}

export async function getDeliveryByOrderId(
  supabase: SupabaseClient<Database>,
  orderId: string
): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch delivery by order id.");

  return data ?? null;
}

export async function createDelivery(
  supabase: SupabaseClient<Database>,
  payload: DeliveryInsert
): Promise<Delivery> {
  const { data, error } = await supabase
    .from("deliveries")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create delivery.");

  return data;
}

export async function updateDelivery(
  supabase: SupabaseClient<Database>,
  deliveryId: string,
  payload: DeliveryUpdate
): Promise<Delivery | null> {
  const { data, error } = await supabase
    .from("deliveries")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId)
    .select("*")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to update delivery.");

  return data ?? null;
}
