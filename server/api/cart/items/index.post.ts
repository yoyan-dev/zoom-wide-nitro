import { defineEventHandler, readBody } from "h3";
import { addCartItem } from "../../../services/cart/add-cart-item";
import { handleRouteError } from "../../../utils/handle-route-error";
import { ok } from "../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const cart = await addCartItem(await readBody(event));

    return ok(cart, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
