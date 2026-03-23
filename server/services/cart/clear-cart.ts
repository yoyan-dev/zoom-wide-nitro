import { clearCartItemsRecord } from "../../repositories/cart/clear-cart-items";
import { getActiveCartByCustomerIdRecord } from "../../repositories/cart/get-active-cart-by-customer-id";
import { touchCartRecord } from "../../repositories/cart/touch-cart";
import { getValidCartCustomer } from "./get-valid-cart-customer";

export async function clearCart(customerId: unknown): Promise<void> {
  const customer = await getValidCartCustomer(customerId);
  const cart = await getActiveCartByCustomerIdRecord(customer.id);

  if (!cart) {
    return;
  }

  await clearCartItemsRecord(cart.id);
  await touchCartRecord(cart.id);
}
