import type { Delivery } from "../../types";
import { createDeliveryRecord } from "../../repositories/deliveries/create-delivery";
import { getDeliveryByOrderIdRecord } from "../../repositories/deliveries/get-delivery-by-order-id";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { createDeliverySchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { requireOrderApprovedForDelivery } from "../orders/order-workflow-rules";
import { mapDelivery } from "./map-delivery";

export async function createDelivery(input: unknown): Promise<Delivery> {
  const parsedInput = createDeliverySchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const order = requireOrderApprovedForDelivery(
    await getOrderByIdRecord(parsedInput.data.order_id),
  );

  const existingDelivery = await getDeliveryByOrderIdRecord(order.id);

  if (existingDelivery) {
    throw badRequestError("Delivery already exists for this order");
  }

  if (parsedInput.data.status !== "scheduled") {
    throw badRequestError("Delivery must start as scheduled");
  }

  if (parsedInput.data.delivered_at) {
    throw badRequestError(
      "delivered_at cannot be set when creating a delivery",
    );
  }

  const delivery = await createDeliveryRecord({
    ...parsedInput.data,
    delivered_at: null,
  });

  return mapDelivery(delivery);
}
