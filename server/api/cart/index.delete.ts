import { defineEventHandler, setResponseStatus } from "h3";
import { clearCart } from "../../services/cart/clear-cart";
import { requireCartWriteAccess } from "../../services/cart/require-cart-access";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { noContent } from "../../utils/response";
import { string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, {
      customer_id: (value) => string(value, "customer_id"),
    });

    await requireCartWriteAccess(event, query.customer_id);

    await clearCart(query.customer_id);

    setResponseStatus(event, 204);
    return noContent("Cart cleared");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
