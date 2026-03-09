import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { createDeliveryService } from "../../services/delivery.service";
import type { CreateDeliveryPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "deliveries.manage");
  const payload = await readBody<CreateDeliveryPayload>(event);
  return createDeliveryService(event, payload);
});
