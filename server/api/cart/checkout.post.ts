import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { checkoutCart } from "../../services/cart/checkout-cart";
import { handleRouteError } from "../../utils/handle-route-error";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const order = await checkoutCart(await readBody(event));

    setResponseStatus(event, 201);
    return created(order, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
