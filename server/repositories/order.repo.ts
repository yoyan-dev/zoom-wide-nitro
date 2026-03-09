import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  Order,
  OrderInsert,
  OrderItem,
  OrderItemInsert,
  OrderUpdate,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    sku: string;
    name: string;
    unit: string;
  } | null;
}

export async function listOrders(
  supabase: SupabaseClient<Database>
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  assertSupabaseSuccess(error, "Failed to fetch orders.");

  return data ?? [];
}

export async function getOrderById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch order.");

  return data ?? null;
}

export async function createOrder(
  supabase: SupabaseClient<Database>,
  payload: OrderInsert
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create order.");

  return data;
}

export async function createOrderItems(
  supabase: SupabaseClient<Database>,
  payload: OrderItemInsert[]
): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from("order_items")
    .insert(payload)
    .select("*");
  assertSupabaseSuccess(error, "Failed to create order items.");

  return data ?? [];
}

export async function listOrderItems(
  supabase: SupabaseClient<Database>,
  orderId: string
): Promise<OrderItemWithProduct[]> {
  const { data, error } = await supabase
    .from("order_items")
    .select("*, product:products(id, sku, name, unit)")
    .eq("order_id", orderId);
  assertSupabaseSuccess(error, "Failed to fetch order items.");

  return (data ?? []) as OrderItemWithProduct[];
}

export async function updateOrder(
  supabase: SupabaseClient<Database>,
  orderId: string,
  payload: OrderUpdate
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("*")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to update order.");

  return data ?? null;
}
