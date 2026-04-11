import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateDeliveryStatus } from "../../../../../services/deliveries/update-delivery-status";
import { requireDriverOrderAccess } from "../../../../../services/drivers/require-driver-order-access";
import { handleRouteError } from "../../../../../utils/handle-route-error";
import { ok } from "../../../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const { delivery } = await requireDriverOrderAccess(event, {
      driverId: getRouterParam(event, "id"),
      orderId: getRouterParam(event, "orderId"),
    });
    const body =
      ((await readBody(event).catch(() => undefined)) as
        | { delivered_at?: string | null }
        | undefined) ?? {};
    const updatedDelivery = await updateDeliveryStatus(delivery.id, {
      status: "delivered",
      delivered_at: body.delivered_at,
    });

    return ok(
      {
        order: updatedDelivery.order ?? null,
        delivery: updatedDelivery,
      },
      {
        total: 1,
      },
    );
  } catch (error) {
    return handleRouteError(event, error);
  }
});
