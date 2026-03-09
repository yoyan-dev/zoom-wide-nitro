import { defineEventHandler } from "h3";
import { requirePermission } from "../../middleware/admin";
import { getStockService } from "../../services/inventory.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "inventory.read");
  return getStockService(event);
});
