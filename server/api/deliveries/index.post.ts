import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createDelivery } from "../../services/deliveries/create-delivery";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "deliveries:write");

    const delivery = await createDelivery(await readBody(event));

    setResponseStatus(event, 201);
    return created(delivery, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
