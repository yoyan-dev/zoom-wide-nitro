import { defineEventHandler } from "h3";
import { requirePermission } from "../../middleware/admin";
import { listProductsService } from "../../services/product.service";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "products.read");
  return listProductsService(event);
});
