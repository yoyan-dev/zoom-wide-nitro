import { deleteCartItemRecord } from "../../repositories/cart/delete-cart-item";
import { getActiveCartByCustomerIdRecord } from "../../repositories/cart/get-active-cart-by-customer-id";
import { getCartItemByIdRecord } from "../../repositories/cart/get-cart-item-by-id";
import { touchCartRecord } from "../../repositories/cart/touch-cart";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { getValidCartCustomer } from "./get-valid-cart-customer";

type RemoveCartItemParams = {
  customer_id: unknown;
  item_id: unknown;
};

export async function removeCartItem(params: RemoveCartItemParams): Promise<void> {
  const customer = await getValidCartCustomer(params.customer_id);
  const itemId = string(params.item_id, "item_id");
  const cart = await getActiveCartByCustomerIdRecord(customer.id);

  if (!cart) {
    throw notFoundError("Active cart not found");
  }

  const item = await getCartItemByIdRecord(itemId);

  if (!item || item.cart_id !== cart.id) {
    throw notFoundError("Cart item not found");
  }

  await deleteCartItemRecord(item.id);
  await touchCartRecord(cart.id);
}
