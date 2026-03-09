import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { createOrderService } from "../../services/order.service";
import type { CreateOrderPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "orders.create");
  const payload = await readBody<CreateOrderPayload>(event);
  return createOrderService(event, payload);
});
