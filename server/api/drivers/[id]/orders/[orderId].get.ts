import { defineEventHandler, getRouterParam } from "h3";
import { requireDriverOrderAccess } from "../../../../services/drivers/require-driver-order-access";
import { getOrderById } from "../../../../services/orders/get-order-by-id";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { ok } from "../../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const orderId = getRouterParam(event, "orderId");
    const { delivery } = await requireDriverOrderAccess(event, {
      driverId: getRouterParam(event, "id"),
      orderId,
    });
    const order = await getOrderById(orderId);

    return ok(
      {
        order,
        delivery,
      },
      {
        total: 1,
      },
    );
  } catch (error) {
    return handleRouteError(event, error);
  }
});
