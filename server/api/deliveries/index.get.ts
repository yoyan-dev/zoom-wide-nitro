import { defineEventHandler } from "h3";
import { requirePermission } from "../../middleware/admin";
import { listDeliveriesService } from "../../services/delivery.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "deliveries.read");
  return listDeliveriesService(event);
});
