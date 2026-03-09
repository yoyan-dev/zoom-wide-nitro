import { createError, type H3Event } from "h3";
import type { Cart, CartItem, Product } from "../../shared/types";
import type { AddCartItemPayload, RemoveCartItemPayload } from "../types";
import {
  clearCartItems,
  createCartItem,
  deleteCartItem,
  getCartItem,
  getOrCreateActiveCart,
  listCartItems,
  updateCartItemQuantity,
} from "../repositories/cart.repo";
import { getCustomerById } from "../repositories/customer.repo";
import { getProductById } from "../repositories/product.repo";
import { assertExists, getSupabaseClient } from "../utils/supabase";

export interface CartResponse {
  cart: Cart;
  items: (CartItem & { product: Product | null })[];
  total: number;
}

function ensurePositiveQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "quantity must be a positive integer.",
    });
  }
}

export async function getCartService(
  event: H3Event,
  customerId: string
): Promise<CartResponse> {
  const supabase = getSupabaseClient(event);
  const customer = await getCustomerById(supabase, customerId);
  assertExists(customer, "Customer not found.");

  const cart = await getOrCreateActiveCart(supabase, customerId);
  const items = await listCartItems(supabase, cart.id);
  const total = items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );

  return { cart, items, total };
}

export async function addToCartService(
  event: H3Event,
  payload: AddCartItemPayload
): Promise<CartResponse> {
  ensurePositiveQuantity(payload.quantity);

  const supabase = getSupabaseClient(event);
  const customer = await getCustomerById(supabase, payload.customer_id);
  assertExists(customer, "Customer not found.");

  const product = await getProductById(supabase, payload.product_id);
  const safeProduct = assertExists(product, "Product not found.");

  if (!safeProduct.is_active) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product is inactive.",
    });
  }

  const cart = await getOrCreateActiveCart(supabase, payload.customer_id);
  const existingItem = await getCartItem(supabase, cart.id, payload.product_id);
  const nextQuantity = (existingItem?.quantity ?? 0) + payload.quantity;

  if (nextQuantity > safeProduct.stock_quantity) {
    throw createError({
      statusCode: 400,
      statusMessage: `Insufficient stock for ${safeProduct.name}.`,
    });
  }

  if (existingItem) {
    await updateCartItemQuantity(supabase, existingItem.id, nextQuantity);
  } else {
    await createCartItem(supabase, {
      cart_id: cart.id,
      product_id: payload.product_id,
      quantity: payload.quantity,
      unit_price: Number(safeProduct.price),
    });
  }

  return getCartService(event, payload.customer_id);
}

export async function removeFromCartService(
  event: H3Event,
  payload: RemoveCartItemPayload
): Promise<CartResponse> {
  const supabase = getSupabaseClient(event);
  const customer = await getCustomerById(supabase, payload.customer_id);
  assertExists(customer, "Customer not found.");

  const cart = await getOrCreateActiveCart(supabase, payload.customer_id);
  await deleteCartItem(supabase, cart.id, payload.product_id);

  return getCartService(event, payload.customer_id);
}

export async function clearCartService(
  event: H3Event,
  customerId: string
): Promise<{ success: true }> {
  const supabase = getSupabaseClient(event);
  const customer = await getCustomerById(supabase, customerId);
  assertExists(customer, "Customer not found.");

  const cart = await getOrCreateActiveCart(supabase, customerId);
  await clearCartItems(supabase, cart.id);

  return { success: true };
}
