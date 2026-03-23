import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { removeCartItem } from "../../../services/cart/remove-cart-item";
import { requireCartWriteAccess } from "../../../services/cart/require-cart-access";
import { handleRouteError } from "../../../utils/handle-route-error";
import { parseQuery } from "../../../utils/query";
import { noContent } from "../../../utils/response";
import { string } from "../../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, {
      customer_id: (value) => string(value, "customer_id"),
    });

    await requireCartWriteAccess(event, query.customer_id);

    await removeCartItem({
      customer_id: query.customer_id,
      item_id: getRouterParam(event, "id"),
    });

    setResponseStatus(event, 204);
    return noContent("Cart item removed");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
