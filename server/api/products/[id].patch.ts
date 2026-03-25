import { defineEventHandler, getRouterParam } from "h3";
import { updateProduct } from "../../services/products/update-product";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireMultipartFormData } from "../../utils/multipart";
import { requirePermission } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    // requirePermission(event, "products:write");

    const formData = await requireMultipartFormData(event, "product update");
    const product = await updateProduct({
      id: getRouterParam(event, "id"),
      parts: formData,
    });

    return ok(product, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
