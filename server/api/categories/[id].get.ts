import { createError, defineEventHandler, getRouterParam } from "h3";
import { requirePermission } from "../../middleware/admin";
import { getCategoryService } from "../../services/category.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "categories.read");

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing category id.",
    });
  }

  return getCategoryService(event, id);
});
