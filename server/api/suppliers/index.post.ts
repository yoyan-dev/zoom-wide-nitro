import { defineEventHandler, setResponseStatus } from "h3";
import { createSupplier } from "../../services/suppliers/create-supplier";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireMultipartFormData } from "../../utils/multipart";
import { requirePermission } from "../../utils/permissions";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "suppliers:write");

    const formData = await requireMultipartFormData(event, "supplier creation");
    const supplier = await createSupplier(formData);

    setResponseStatus(event, 201);
    return created(supplier, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
