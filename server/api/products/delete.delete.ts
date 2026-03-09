import { createError, defineEventHandler, getQuery } from "h3";
import { requirePermission } from "../../middleware/admin";
import { deleteProductService } from "../../services/product.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "products.manage");

  const query = getQuery(event);
  const id = typeof query.id === "string" ? query.id : "";
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "id query parameter is required.",
    });
  }

  return deleteProductService(event, id);
});
