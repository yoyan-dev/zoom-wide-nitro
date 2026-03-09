import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { updateCategoryService } from "../../services/category.service";
import type { UpdateCategoryPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "categories.manage");
  const payload = await readBody<UpdateCategoryPayload>(event);
  return updateCategoryService(event, payload);
});
