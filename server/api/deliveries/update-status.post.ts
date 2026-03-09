import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { updateDeliveryStatusService } from "../../services/delivery.service";
import type { UpdateDeliveryStatusPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "deliveries.update_status");
  const payload = await readBody<UpdateDeliveryStatusPayload>(event);
  return updateDeliveryStatusService(event, payload);
});
