import { defineEventHandler, setResponseStatus } from "h3";
import { createInventoryLog } from "../../services/inventory/create-inventory-log";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireMultipartFormData } from "../../utils/multipart";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const formData = await requireMultipartFormData(event, "inventory creation");
    const inventoryLog = await createInventoryLog(formData);

    setResponseStatus(event, 201);
    return created(inventoryLog, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
