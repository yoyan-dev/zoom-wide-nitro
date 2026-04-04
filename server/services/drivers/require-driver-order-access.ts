import type { H3Event } from "h3";
import type { Delivery, Driver } from "../../types";
import { getDeliveryByOrderIdRecord } from "../../repositories/deliveries/get-delivery-by-order-id";
import { forbiddenError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapDelivery } from "../deliveries/map-delivery";
import { requireDriverAccess } from "./require-driver-access";

export async function requireDriverOrderAccess(
  event: H3Event,
  params: {
    driverId: unknown;
    orderId: unknown;
  },
): Promise<{
  driver: Driver;
  delivery: Delivery;
}> {
  const driver = await requireDriverAccess(
    event,
    params.driverId,
    "You do not have permission to access this driver's assigned orders",
  );
  const orderId = string(params.orderId, "Order id");
  const delivery = await getDeliveryByOrderIdRecord(orderId);

  if (!delivery) {
    throw notFoundError("Assigned order not found");
  }

  const mappedDelivery = mapDelivery(delivery);

  if (mappedDelivery.driver_id !== driver.id) {
    throw forbiddenError(
      "You do not have permission to access this driver's assigned orders",
    );
  }

  return {
    driver,
    delivery: mappedDelivery,
  };
}
