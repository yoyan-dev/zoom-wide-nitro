import { defineEventHandler, getRouterParam } from "h3";
import { requireOrderAccess } from "../../services/orders/require-order-access";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const order = await requireOrderAccess(
      event,
      getRouterParam(event, "id"),
      "orders:read",
    );

    return ok(order, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
