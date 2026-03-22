import type { CartDetail } from "../../../types";
import { ensureActiveCartRecord } from "./ensure-active-cart";
import { getValidCartCustomer } from "./get-valid-cart-customer";
import { mapCart } from "./map-cart";

export async function getActiveCart(customerId: unknown): Promise<CartDetail> {
  const customer = await getValidCartCustomer(customerId);
  const cart = await ensureActiveCartRecord(customer.id);

  return mapCart(cart);
}
