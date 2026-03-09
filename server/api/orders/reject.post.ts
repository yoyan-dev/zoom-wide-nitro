import { createError, defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { rejectOrderService } from "../../services/order.service";

interface RejectOrderPayload {
  order_id: string;
  reason: string;
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, "orders.manage");
  const payload = await readBody<RejectOrderPayload>(event);

  if (!payload.order_id || !payload.reason) {
    throw createError({
      statusCode: 400,
      statusMessage: "order_id and reason are required.",
    });
  }

  const rejectedBy =
    event.context.auth?.profile?.id ?? event.context.auth?.supabaseUser?.id;
  return rejectOrderService(event, payload.order_id, payload.reason, rejectedBy);
});
