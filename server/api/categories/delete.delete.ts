import { createError, defineEventHandler, getQuery } from "h3";
import { requirePermission } from "../../middleware/admin";
import { deleteCategoryService } from "../../services/category.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "categories.manage");

  const query = getQuery(event);
  const id = typeof query.id === "string" ? query.id : "";
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "id query parameter is required.",
    });
  }

  return deleteCategoryService(event, id);
});
