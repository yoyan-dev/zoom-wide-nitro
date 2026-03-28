import type { H3Event } from "h3";
import type { DeliveryStatus } from "../../types";
import { badRequestError } from "../../utils/errors";
import { requireOrderAccess } from "../orders/require-order-access";
import {
  requireOwnershipOrPermission,
  requirePermission,
} from "../../utils/permissions";

export const DELIVERY_REPORT_STATUSES = [
  "scheduled",
  "in_transit",
  "delivered",
  "failed",
  "cancelled",
] as const satisfies readonly DeliveryStatus[];

const DELIVERY_REPORT_STATUS_SET = new Set<string>(DELIVERY_REPORT_STATUSES);

export function assertValidDeliveryReportStatus(
  status?: string,
): DeliveryStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (!DELIVERY_REPORT_STATUS_SET.has(status)) {
    throw badRequestError("status must be a valid delivery status");
  }

  return status as DeliveryStatus;
}

export async function requireDeliveryReportAccess(
  event: H3Event,
  params: {
    orderId?: string;
    driverId?: string;
  },
): Promise<void> {
  const hasOrderFilter = Boolean(params.orderId);
  const hasDriverFilter = Boolean(params.driverId);

  if (!hasOrderFilter && !hasDriverFilter) {
    requirePermission(event, "deliveries:report");
    return;
  }

  if (params.orderId) {
    await requireOrderAccess(
      event,
      params.orderId,
      "deliveries:report",
      "You do not have permission to view deliveries for this order",
    );
  }

  if (params.driverId) {
    requireOwnershipOrPermission(
      event,
      params.driverId,
      "deliveries:report",
      "You do not have permission to view deliveries for this driver",
    );
  }
}
