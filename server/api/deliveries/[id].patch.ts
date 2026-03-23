import { defineEventHandler, getRouterParam, readBody } from "h3";
import { requireDeliveryStatusAccess } from "../../services/deliveries/require-delivery-status-access";
import { updateDeliveryStatus } from "../../services/deliveries/update-delivery-status";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const deliveryId = getRouterParam(event, "id");

    await requireDeliveryStatusAccess(event, deliveryId);

    const delivery = await updateDeliveryStatus(
      deliveryId,
      await readBody(event),
    );

    return ok(delivery, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
