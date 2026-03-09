import { createError, defineEventHandler, getQuery } from "h3";
import { requirePermission } from "../../middleware/admin";
import { getCartService } from "../../services/cart.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "carts.manage");

  const query = getQuery(event);
  const customerId = typeof query.customer_id === "string" ? query.customer_id : "";
  if (!customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: "customer_id query parameter is required.",
    });
  }

  return getCartService(event, customerId);
});
