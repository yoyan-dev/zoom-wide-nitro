import { defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { addToCartService } from "../../services/cart.service";
import type { AddCartItemPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requirePermission(event, "carts.manage");
  const payload = await readBody<AddCartItemPayload>(event);
  return addToCartService(event, payload);
});
