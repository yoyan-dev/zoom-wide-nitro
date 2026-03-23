import { defineEventHandler, readBody } from "h3";
import { addCartItem } from "../../../services/cart/add-cart-item";
import { requireCartWriteAccess } from "../../../services/cart/require-cart-access";
import { handleRouteError } from "../../../utils/handle-route-error";
import { ok } from "../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    await requireCartWriteAccess(
      event,
      (body as { customer_id?: unknown })?.customer_id,
    );

    const cart = await addCartItem(body);

    return ok(cart, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
