import type { Order } from "../../../types";
import { badRequestError, notFoundError } from "../../utils/errors";

export function requireExistingOrder(order: Order | null): Order {
  if (!order) {
    throw notFoundError("Order not found");
  }

  return order;
}

export function requireOrderApprovedForDelivery(order: Order | null): Order {
  const existingOrder = requireExistingOrder(order);

  if (existingOrder.status !== "approved") {
    throw badRequestError("Only approved orders can be scheduled for delivery");
  }

  return existingOrder;
}

export function requireOrderEligibleForDeliveryUpdate(
  order: Order | null,
): Order {
  const existingOrder = requireExistingOrder(order);

  if (existingOrder.status !== "approved") {
    throw badRequestError("Order is not eligible for delivery updates");
  }

  return existingOrder;
}

export function requireOrderEligibleForPayment(order: Order | null): Order {
  const existingOrder = requireExistingOrder(order);

  if (existingOrder.status === "rejected") {
    throw badRequestError("Rejected orders cannot be paid");
  }

  if (!["approved", "completed"].includes(existingOrder.status)) {
    throw badRequestError("Order is not eligible for payment");
  }

  return existingOrder;
}

export function requireOrderEligibleForPaymentCompletion(
  order: Order | null,
): Order {
  const existingOrder = requireExistingOrder(order);

  if (existingOrder.status === "rejected") {
    throw badRequestError("Rejected orders cannot be paid");
  }

  if (!["approved", "completed"].includes(existingOrder.status)) {
    throw badRequestError("Order is not eligible for payment completion");
  }

  return existingOrder;
}
