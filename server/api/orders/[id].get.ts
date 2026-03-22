import { defineEventHandler, getRouterParam } from "h3";
import { getOrderById } from "../../services/orders/get-order-by-id";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const order = await getOrderById(getRouterParam(event, "id"));

    return ok(order, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
