import { defineEventHandler, getRouterParam } from "h3";
import { getProductById } from "../../services/products/get-product-by-id";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const product = await getProductById(getRouterParam(event, "id"));

    return ok(product, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
