import type { H3Event } from "h3";
import type { OrderStatus } from "../../types";
import { requireCustomerAccess } from "../customers/require-customer-access";
import { badRequestError } from "../../utils/errors";
import { requirePermission } from "../../utils/permissions";

export const ORDER_REPORT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
] as const satisfies readonly OrderStatus[];

const ORDER_REPORT_STATUS_SET = new Set<string>(ORDER_REPORT_STATUSES);

export function assertValidOrderReportStatus(
  status?: string,
): OrderStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (!ORDER_REPORT_STATUS_SET.has(status)) {
    throw badRequestError("status must be a valid order status");
  }

  return status as OrderStatus;
}

export async function requireOrderReportAccess(
  event: H3Event,
  customerId?: string,
): Promise<void> {
  if (customerId) {
    await requireCustomerAccess(event, customerId, "orders:report");
    return;
  }

  requirePermission(event, "orders:report");
}
