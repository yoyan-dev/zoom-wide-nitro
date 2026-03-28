import type { H3Event } from "h3";
import { requireOrderAccess } from "../orders/require-order-access";
import { getDriverByUserId } from "../drivers/get-driver-by-user-id";
import {
  hasPermission,
  requireActiveRequestUser,
  requirePermission,
} from "../../utils/permissions";
import { forbiddenError } from "../../utils/errors";

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
    const user = requireActiveRequestUser(event);

    if (user.role === "driver") {
      const driver = await getDriverByUserId(user.id);

      if (!driver || driver.id !== params.driverId) {
        throw forbiddenError(
          "You do not have permission to view deliveries for this driver",
        );
      }
    } else if (!hasPermission(user, "deliveries:read")) {
      throw forbiddenError(
        "You do not have permission to view deliveries for this driver",
      );
    }
  }
}
