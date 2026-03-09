import { createError, defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { clearCartService } from "../../services/cart.service";

interface ClearCartPayload {
  customer_id: string;
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, "carts.manage");
  const payload = await readBody<ClearCartPayload>(event);

  if (!payload.customer_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "customer_id is required.",
    });
  }

  return clearCartService(event, payload.customer_id);
});
