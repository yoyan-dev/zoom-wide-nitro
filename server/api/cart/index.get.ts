import { defineEventHandler } from "h3";
import { getActiveCart } from "../../services/cart/get-active-cart";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { ok } from "../../utils/response";
import { string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, {
      customer_id: (value) => string(value, "customer_id"),
    });

    const cart = await getActiveCart(query.customer_id);

    return ok(cart, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
