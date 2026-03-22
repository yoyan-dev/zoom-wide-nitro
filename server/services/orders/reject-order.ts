import type { Order } from "../../../types";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { updateOrderRecord } from "../../repositories/orders/update-order";
import { rejectOrderSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapOrder } from "./map-order";

export async function rejectOrder(
  id: unknown,
  input: unknown,
): Promise<Order> {
  const parsedInput = rejectOrderSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const orderId = string(id, "Order id");

  const order = await getOrderByIdRecord(orderId);

  if (!order) {
    throw notFoundError("Order not found");
  }

  if (mapOrder(order).status !== "pending") {
    throw badRequestError("Only pending orders can be rejected");
  }

  const rejectedOrder = await updateOrderRecord(orderId, {
    status: "rejected",
    approved_by: null,
    rejection_reason: parsedInput.data.rejection_reason,
  });

  if (!rejectedOrder) {
    throw notFoundError("Order not found");
  }

  return mapOrder(rejectedOrder);
}
