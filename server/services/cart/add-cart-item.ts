import type { CartDetail } from "../../../types";
import { createCartItemRecord } from "../../repositories/cart/create-cart-item";
import { getCartItemByProductRecord } from "../../repositories/cart/get-cart-item-by-product";
import { getActiveCartByCustomerIdRecord } from "../../repositories/cart/get-active-cart-by-customer-id";
import { touchCartRecord } from "../../repositories/cart/touch-cart";
import { updateCartItemRecord } from "../../repositories/cart/update-cart-item";
import { addCartItemSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { ensureActiveCartRecord } from "./ensure-active-cart";
import { getValidCartCustomer } from "./get-valid-cart-customer";
import { getValidCartProduct } from "./get-valid-cart-product";
import { mapCart } from "./map-cart";

export async function addCartItem(input: unknown): Promise<CartDetail> {
  const parsedInput = addCartItemSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const customer = await getValidCartCustomer(parsedInput.data.customer_id);
  const product = await getValidCartProduct(parsedInput.data.product_id);
  const cart = await ensureActiveCartRecord(customer.id);
  const existingItem = await getCartItemByProductRecord(cart.id, product.id);

  if (existingItem) {
    await updateCartItemRecord(existingItem.id, {
      quantity: existingItem.quantity + parsedInput.data.quantity,
      unit_price: product.price,
    });
  } else {
    await createCartItemRecord({
      cart_id: cart.id,
      product_id: product.id,
      quantity: parsedInput.data.quantity,
      unit_price: product.price,
    });
  }

  await touchCartRecord(cart.id);

  const updatedCart = await getActiveCartByCustomerIdRecord(customer.id);

  if (!updatedCart) {
    throw badRequestError("Active cart could not be loaded");
  }

  return mapCart(updatedCart);
}
