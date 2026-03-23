import type { H3Event } from "h3";
import { requireOrderAccess } from "../orders/require-order-access";
import {
  requireOwnershipOrPermission,
  requirePermission,
} from "../../utils/permissions";

type DeliveryListAccessParams = {
  orderId?: string;
  driverId?: string;
};

export async function requireDeliveryListAccess(
  event: H3Event,
  params: DeliveryListAccessParams,
): Promise<void> {
  const hasOrderFilter = Boolean(params.orderId);
  const hasDriverFilter = Boolean(params.driverId);

  if (!hasOrderFilter && !hasDriverFilter) {
    requirePermission(event, "deliveries:read");
    return;
  }

  if (params.orderId) {
    await requireOrderAccess(
      event,
      params.orderId,
      "deliveries:read",
      "You do not have permission to view deliveries for this order",
    );
  }

  if (params.driverId) {
    requireOwnershipOrPermission(
      event,
      params.driverId,
      "deliveries:read",
      "You do not have permission to view deliveries for this driver",
    );
  }
}
