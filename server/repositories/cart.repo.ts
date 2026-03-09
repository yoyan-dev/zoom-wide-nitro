import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Cart,
  CartItem,
  CartItemInsert,
  Database,
  Product,
} from "../../shared/types";
import { assertSupabaseSuccess } from "../utils/supabase";

export interface CartItemWithProduct extends CartItem {
  product: Product | null;
}

export async function getActiveCartByCustomerId(
  supabase: SupabaseClient<Database>,
  customerId: string
): Promise<Cart | null> {
  const { data, error } = await supabase
    .from("carts")
    .select("*")
    .eq("customer_id", customerId)
    .eq("status", "active")
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch active cart.");

  return data ?? null;
}

export async function createActiveCart(
  supabase: SupabaseClient<Database>,
  customerId: string
): Promise<Cart> {
  const { data, error } = await supabase
    .from("carts")
    .insert({
      customer_id: customerId,
      status: "active",
    })
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create cart.");

  return data;
}

export async function getOrCreateActiveCart(
  supabase: SupabaseClient<Database>,
  customerId: string
): Promise<Cart> {
  const existing = await getActiveCartByCustomerId(supabase, customerId);
  if (existing) {
    return existing;
  }

  return createActiveCart(supabase, customerId);
}

export async function listCartItems(
  supabase: SupabaseClient<Database>,
  cartId: string
): Promise<CartItemWithProduct[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*, product:products(*)")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });
  assertSupabaseSuccess(error, "Failed to fetch cart items.");

  return (data ?? []) as CartItemWithProduct[];
}

export async function getCartItem(
  supabase: SupabaseClient<Database>,
  cartId: string,
  productId: string
): Promise<CartItem | null> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();
  assertSupabaseSuccess(error, "Failed to fetch cart item.");

  return data ?? null;
}

export async function createCartItem(
  supabase: SupabaseClient<Database>,
  payload: CartItemInsert
): Promise<CartItem> {
  const { data, error } = await supabase
    .from("cart_items")
    .insert(payload)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to create cart item.");

  return data;
}

export async function updateCartItemQuantity(
  supabase: SupabaseClient<Database>,
  cartItemId: string,
  quantity: number
): Promise<CartItem> {
  const { data, error } = await supabase
    .from("cart_items")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartItemId)
    .select("*")
    .single();
  assertSupabaseSuccess(error, "Failed to update cart item.");

  return data;
}

export async function deleteCartItem(
  supabase: SupabaseClient<Database>,
  cartId: string,
  productId: string
): Promise<void> {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId)
    .eq("product_id", productId);
  assertSupabaseSuccess(error, "Failed to remove cart item.");
}

export async function clearCartItems(
  supabase: SupabaseClient<Database>,
  cartId: string
): Promise<void> {
  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId);
  assertSupabaseSuccess(error, "Failed to clear cart.");
}
