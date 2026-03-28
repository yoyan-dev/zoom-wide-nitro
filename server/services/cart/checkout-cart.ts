import type { Order } from "../../types";
import { finalizeCartCheckoutRecord } from "../../repositories/cart/finalize-cart-checkout";
import { getActiveCartByCustomerIdRecord } from "../../repositories/cart/get-active-cart-by-customer-id";
import { deleteOrderRecord } from "../../repositories/orders/delete-order";
import { checkoutCartSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { createPendingOrder } from "../orders/create-pending-order";

export async function checkoutCart(input: unknown): Promise<Order> {
  const parsedInput = checkoutCartSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const cart = await getActiveCartByCustomerIdRecord(
    parsedInput.data.customer_id,
  );

  if (!cart) {
    throw notFoundError("Active cart not found");
  }

  if (!cart.items || cart.items.length === 0) {
    throw badRequestError("Cart is empty");
  }

  const order = await createPendingOrder({
    customer_id: parsedInput.data.customer_id,
    notes: parsedInput.data.notes ?? null,
    requireSufficientStock: true,
    items: cart.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
  });

  try {
    const checkedOutCart = await finalizeCartCheckoutRecord(cart.id);

    if (!checkedOutCart) {
      throw badRequestError("Cart is no longer active for checkout");
    }
  } catch (error) {
    await deleteOrderRecord(order.id);
    throw error;
  }

  return order;
}
