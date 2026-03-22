import type { Delivery, DeliveryStatus } from "../../../types";
import { getDeliveryByIdRecord } from "../../repositories/deliveries/get-delivery-by-id";
import { updateDeliveryRecord } from "../../repositories/deliveries/update-delivery";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { updateOrderRecord } from "../../repositories/orders/update-order";
import { updateDeliveryStatusSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapDelivery } from "./map-delivery";

const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  scheduled: ["in_transit", "failed", "cancelled"],
  in_transit: ["delivered", "failed", "cancelled"],
  delivered: [],
  failed: [],
  cancelled: [],
};

function canTransitionDeliveryStatus(
  currentStatus: DeliveryStatus,
  nextStatus: DeliveryStatus,
) {
  return currentStatus === nextStatus
    || DELIVERY_TRANSITIONS[currentStatus].includes(nextStatus);
}

export async function updateDeliveryStatus(
  id: unknown,
  input: unknown,
): Promise<Delivery> {
  const deliveryId = string(id, "Delivery id");
  const parsedInput = updateDeliveryStatusSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const delivery = await getDeliveryByIdRecord(deliveryId);

  if (!delivery) {
    throw notFoundError("Delivery not found");
  }

  if (!canTransitionDeliveryStatus(delivery.status, parsedInput.data.status)) {
    throw badRequestError("Invalid delivery status transition");
  }

  const order = await getOrderByIdRecord(delivery.order_id);

  if (!order) {
    throw notFoundError("Order not found");
  }

  if (
    ["scheduled", "in_transit", "delivered"].includes(parsedInput.data.status)
    && !["approved", "completed"].includes(order.status)
  ) {
    throw badRequestError("Order is not eligible for delivery updates");
  }

  const nextDeliveredAt =
    parsedInput.data.status === "delivered"
      ? parsedInput.data.delivered_at ?? new Date().toISOString()
      : null;

  const updatedDelivery = await updateDeliveryRecord(deliveryId, {
    status: parsedInput.data.status,
    delivered_at: nextDeliveredAt,
  });

  if (!updatedDelivery) {
    throw notFoundError("Delivery not found");
  }

  if (parsedInput.data.status === "delivered" && order.status !== "completed") {
    await updateOrderRecord(order.id, {
      status: "completed",
    });
  }

  return mapDelivery(updatedDelivery);
}
