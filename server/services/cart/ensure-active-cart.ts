import type { CartRecord } from "../../repositories/cart/get-active-cart-by-customer-id";
import { createCartRecord } from "../../repositories/cart/create-cart";
import { getActiveCartByCustomerIdRecord } from "../../repositories/cart/get-active-cart-by-customer-id";

export async function ensureActiveCartRecord(
  customerId: string,
): Promise<CartRecord> {
  const existingCart = await getActiveCartByCustomerIdRecord(customerId);

  if (existingCart) {
    return existingCart;
  }

  return createCartRecord(customerId);
}
