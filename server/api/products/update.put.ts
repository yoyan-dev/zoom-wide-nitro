import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { updateProductService } from "../../services/product.service";
import type { UpdateProductPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "products.manage");
  const payload = await readBody<UpdateProductPayload>(event);
  return updateProductService(event, payload);
});
