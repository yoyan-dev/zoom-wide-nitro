import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { logMovementService } from "../../services/inventory.service";
import type { LogInventoryMovementPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "inventory.manage");
  const payload = await readBody<LogInventoryMovementPayload>(event);
  return logMovementService(event, payload);
});
