import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { removeFromCartService } from "../../services/cart.service";
import type { RemoveCartItemPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "carts.manage");
  const payload = await readBody<RemoveCartItemPayload>(event);
  return removeFromCartService(event, payload);
});
