import { createError, defineEventHandler, getRouterParam } from "h3";
import { requirePermission } from "../../middleware/admin";
import { getOrderService } from "../../services/order.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "orders.read");

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order id.",
    });
  }

  return getOrderService(event, id);
});
