import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { createCategoryService } from "../../services/category.service";
import type { CreateCategoryPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "categories.manage");
  const payload = await readBody<CreateCategoryPayload>(event);
  return createCategoryService(event, payload);
});
