import type { H3Event } from "h3";
import { getDeliveryByIdRecord } from "../../repositories/deliveries/get-delivery-by-id";
import { forbiddenError, notFoundError } from "../../utils/errors";
import {
  requirePermission,
} from "../../utils/permissions";
import { string } from "../../utils/validator";
import { getDriverByUserId } from "../drivers/get-driver-by-user-id";

export async function requireDeliveryStatusAccess(
  event: H3Event,
  id: unknown,
): Promise<void> {
  const user = requirePermission(
    event,
    "deliveries:status",
    "You do not have permission to update this delivery",
  );

  if (user.role !== "driver") {
    return;
  }

  const deliveryId = string(id, "Delivery id");
  const delivery = await getDeliveryByIdRecord(deliveryId);

  if (!delivery) {
    throw notFoundError("Delivery not found");
  }

  const driver = await getDriverByUserId(user.id);

  if (!driver || delivery.driver_id !== driver.id) {
    throw forbiddenError("Drivers can only update deliveries assigned to them");
  }
}
