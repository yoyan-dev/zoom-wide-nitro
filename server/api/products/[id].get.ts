import { createError, defineEventHandler, getRouterParam } from "h3";
import { requirePermission } from "../../middleware/admin";
import { getProductService } from "../../services/product.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "products.read");

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing product id.",
    });
  }

  return getProductService(event, id);
});
