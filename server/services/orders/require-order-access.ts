import type { H3Event } from "h3";
import type { Order } from "../../../types";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { notFoundError } from "../../utils/errors";
import {
  type PermissionAction,
  requireOwnershipOrPermission,
} from "../../utils/permissions";
import { string } from "../../utils/validator";
import { mapOrder } from "./map-order";

export async function requireOrderAccess(
  event: H3Event,
  orderId: unknown,
  fallbackAction: PermissionAction,
  message = "You do not have permission to access this order",
): Promise<Order> {
  const resolvedOrderId = string(orderId, "Order id");
  const order = await getOrderByIdRecord(resolvedOrderId);

  if (!order) {
    throw notFoundError("Order not found");
  }

  const mappedOrder = mapOrder(order);

  requireOwnershipOrPermission(
    event,
    mappedOrder.customer?.user_id,
    fallbackAction,
    message,
  );

  return mappedOrder;
}
