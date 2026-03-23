import type { H3Event } from "h3";
import { getDeliveryByIdRecord } from "../../repositories/deliveries/get-delivery-by-id";
import { notFoundError } from "../../utils/errors";
import {
  requireOwnershipOrPermission,
  requirePermission,
} from "../../utils/permissions";
import { string } from "../../utils/validator";

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

  requireOwnershipOrPermission(
    event,
    delivery.driver_id,
    "deliveries:write",
    "Drivers can only update deliveries assigned to them",
  );
}
