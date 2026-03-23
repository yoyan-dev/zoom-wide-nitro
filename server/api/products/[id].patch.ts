import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateProduct } from "../../services/products/update-product";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "products:write");

    const product = await updateProduct({
      id: getRouterParam(event, "id"),
      input: await readBody(event),
    });

    return ok(product, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
