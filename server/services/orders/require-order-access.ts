import type { H3Event } from "h3";
import type { Order } from "../../types";
import { getDeliveryByOrderIdRecord } from "../../repositories/deliveries/get-delivery-by-order-id";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { forbiddenError, notFoundError } from "../../utils/errors";
import {
  type PermissionAction,
  requireActiveRequestUser,
  requireOwnershipOrPermission,
} from "../../utils/permissions";
import { string } from "../../utils/validator";
import { getDriverByUserId } from "../drivers/get-driver-by-user-id";
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
  const requestUser = requireActiveRequestUser(event);

  if (requestUser.role === "driver") {
    const [driver, delivery] = await Promise.all([
      getDriverByUserId(requestUser.id),
      getDeliveryByOrderIdRecord(mappedOrder.id),
    ]);

    if (!driver || delivery?.driver_id !== driver.id) {
      throw forbiddenError(
        "Drivers can only access orders assigned to them",
      );
    }

    return mappedOrder;
  }

  requireOwnershipOrPermission(
    event,
    mappedOrder.customer?.user_id,
    fallbackAction,
    message,
  );

  return mappedOrder;
}
