import { createError, defineEventHandler, readBody } from "h3";
import { requirePermission } from "../../middleware/admin";
import { approveOrderService } from "../../services/order.service";

interface ApproveOrderPayload {
  order_id: string;
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, "orders.manage");
  const payload = await readBody<ApproveOrderPayload>(event);

  if (!payload.order_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "order_id is required.",
    });
  }

  const approverId =
    event.context.auth?.profile?.id ?? event.context.auth?.supabaseUser?.id;
  return approveOrderService(event, payload.order_id, approverId);
});
