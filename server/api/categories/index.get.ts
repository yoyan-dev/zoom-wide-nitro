import { defineEventHandler } from "h3";
import { requirePermission } from "../../middleware/admin";
import { listCategoriesService } from "../../services/category.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "categories.read");
  return listCategoriesService(event);
});
