import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { checkoutCart } from "../../services/cart/checkout-cart";
import { requireCartWriteAccess } from "../../services/cart/require-cart-access";
import { handleRouteError } from "../../utils/handle-route-error";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    await requireCartWriteAccess(event, (body as { customer_id?: unknown })?.customer_id);

    const order = await checkoutCart(body);

    setResponseStatus(event, 201);
    return created(order, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
