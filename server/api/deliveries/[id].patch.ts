import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateDeliveryStatus } from "../../services/deliveries/update-delivery-status";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const delivery = await updateDeliveryStatus(
      getRouterParam(event, "id"),
      await readBody(event),
    );

    return ok(delivery, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
