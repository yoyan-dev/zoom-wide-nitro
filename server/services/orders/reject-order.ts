import type { Order } from "../../../types";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { transitionOrderStatusRecord } from "../../repositories/orders/transition-order-status";
import { rejectOrderSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { getOrderForDecision } from "./get-order-for-decision";
import { mapOrder } from "./map-order";

export async function rejectOrder(
  id: unknown,
  input: unknown,
): Promise<Order> {
  const parsedInput = rejectOrderSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const order = await getOrderForDecision(id);
  const orderId = order.id;

  const rejectedOrder = await transitionOrderStatusRecord(orderId, {
    currentStatus: "pending",
    nextStatus: "rejected",
    approvedBy: null,
    rejectionReason: parsedInput.data.rejection_reason,
  });

  if (!rejectedOrder) {
    const latestOrder = await getOrderByIdRecord(orderId);

    if (!latestOrder) {
      throw notFoundError("Order not found");
    }

    throw badRequestError("Only pending orders can be reviewed");
  }

  return mapOrder(rejectedOrder);
}
