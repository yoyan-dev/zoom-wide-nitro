import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createInventoryLog } from "../../services/inventory/create-inventory-log";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "inventory:write");

    const inventoryLog = await createInventoryLog(await readBody(event));

    setResponseStatus(event, 201);
    return created(inventoryLog, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
