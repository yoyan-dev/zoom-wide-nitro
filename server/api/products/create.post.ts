import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { createProductService } from "../../services/product.service";
import type { CreateProductPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "products.manage");
  const payload = await readBody<CreateProductPayload>(event);
  return createProductService(event, payload);
});
