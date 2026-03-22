import type { Delivery } from "../../../types";
import { createDeliveryRecord } from "../../repositories/deliveries/create-delivery";
import { getDeliveryByOrderIdRecord } from "../../repositories/deliveries/get-delivery-by-order-id";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { createDeliverySchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { mapDelivery } from "./map-delivery";

const ALLOWED_CREATE_STATUSES = new Set(["scheduled", "in_transit"]);

export async function createDelivery(input: unknown): Promise<Delivery> {
  const parsedInput = createDeliverySchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const order = await getOrderByIdRecord(parsedInput.data.order_id);

  if (!order) {
    throw notFoundError("Order not found");
  }

  if (order.status !== "approved") {
    throw badRequestError("Only approved orders can be scheduled for delivery");
  }

  const existingDelivery = await getDeliveryByOrderIdRecord(order.id);

  if (existingDelivery) {
    throw badRequestError("Delivery already exists for this order");
  }

  if (!ALLOWED_CREATE_STATUSES.has(parsedInput.data.status)) {
    throw badRequestError("Delivery must start as scheduled or in transit");
  }

  if (parsedInput.data.status === "in_transit" && !parsedInput.data.scheduled_at) {
    throw badRequestError("scheduled_at is required when starting in transit");
  }

  const delivery = await createDeliveryRecord({
    ...parsedInput.data,
    delivered_at: null,
  });

  return mapDelivery(delivery);
}
