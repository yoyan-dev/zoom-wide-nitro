import { defineEventHandler, getRouterParam, readBody } from "h3";
import { rejectOrder } from "../../../services/orders/reject-order";
import { handleRouteError } from "../../../utils/handle-route-error";
import { ok } from "../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const order = await rejectOrder(
      getRouterParam(event, "id"),
      await readBody(event),
    );

    return ok(order, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
