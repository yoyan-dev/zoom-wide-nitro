import type { Delivery, DeliveryStatus } from "../../types";
import { getDeliveryByIdRecord } from "../../repositories/deliveries/get-delivery-by-id";
import { updateDeliveryRecord } from "../../repositories/deliveries/update-delivery";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { transitionOrderStatusRecord } from "../../repositories/orders/transition-order-status";
import { updateDeliveryStatusSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { requireOrderEligibleForDeliveryUpdate } from "../orders/order-workflow-rules";
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
  return DELIVERY_TRANSITIONS[currentStatus].includes(nextStatus);
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

  if (
    parsedInput.data.status !== "delivered" &&
    parsedInput.data.delivered_at !== undefined &&
    parsedInput.data.delivered_at !== null
  ) {
    throw badRequestError(
      "delivered_at can only be set when status is delivered",
    );
  }

  const order = requireOrderEligibleForDeliveryUpdate(
    await getOrderByIdRecord(delivery.order_id),
  );

  const nextDeliveredAt =
    parsedInput.data.status === "delivered"
      ? (parsedInput.data.delivered_at ?? new Date().toISOString())
      : null;

  const updatedDelivery = await updateDeliveryRecord(deliveryId, {
    status: parsedInput.data.status,
    delivered_at: nextDeliveredAt,
  });

  if (!updatedDelivery) {
    throw notFoundError("Delivery not found");
  }

  if (parsedInput.data.status === "delivered") {
    const completedOrder = await transitionOrderStatusRecord(order.id, {
      currentStatus: "approved",
      nextStatus: "completed",
    });

    if (!completedOrder) {
      const latestOrder = await getOrderByIdRecord(order.id);

      if (latestOrder?.status === "completed") {
        const refreshedDelivery = await getDeliveryByIdRecord(deliveryId);

        if (!refreshedDelivery) {
          throw notFoundError("Delivery not found");
        }

        return mapDelivery(refreshedDelivery);
      }

      try {
        await updateDeliveryRecord(deliveryId, {
          status: delivery.status,
          delivered_at: delivery.delivered_at,
        });
      } catch {
        // Best-effort rollback only. Preserve the delivery completion error.
      }

      throw badRequestError("Order is not eligible for delivery completion");
    }

    const refreshedDelivery = await getDeliveryByIdRecord(deliveryId);

    if (!refreshedDelivery) {
      throw notFoundError("Delivery not found");
    }

    return mapDelivery(refreshedDelivery);
  }

  return mapDelivery(updatedDelivery);
}
