import { defineEventHandler } from "h3";
import { requirePermission } from "../../middleware/admin";
import { listOrdersService } from "../../services/order.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "orders.read");
  return listOrdersService(event);
});
