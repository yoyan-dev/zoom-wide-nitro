import { defineEventHandler, setResponseStatus } from "h3";
import { createWarehouse } from "../../services/warehouses/create-warehouse";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireMultipartFormData } from "../../utils/multipart";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const formData = await requireMultipartFormData(event, "warehouse creation");
    const warehouse = await createWarehouse(formData);

    setResponseStatus(event, 201);
    return created(warehouse, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
