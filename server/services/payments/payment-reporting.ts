import type { H3Event } from "h3";
import type { PaymentMethod, PaymentStatus } from "../../types";
import { requireOrderAccess } from "../orders/require-order-access";
import { badRequestError } from "../../utils/errors";
import { requirePermission } from "../../utils/permissions";

export const PAYMENT_REPORT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const satisfies readonly PaymentStatus[];

export const PAYMENT_REPORT_METHODS = [
  "cash",
  "card",
  "bank_transfer",
  "mobile_wallet",
] as const satisfies readonly PaymentMethod[];

const PAYMENT_REPORT_STATUS_SET = new Set<string>(PAYMENT_REPORT_STATUSES);
const PAYMENT_REPORT_METHOD_SET = new Set<string>(PAYMENT_REPORT_METHODS);

export function assertValidPaymentReportStatus(
  status?: string,
): PaymentStatus | undefined {
  if (!status) {
    return undefined;
  }

  if (!PAYMENT_REPORT_STATUS_SET.has(status)) {
    throw badRequestError("status must be a valid payment status");
  }

  return status as PaymentStatus;
}

export function assertValidPaymentReportMethod(
  method?: string,
): PaymentMethod | undefined {
  if (!method) {
    return undefined;
  }

  if (!PAYMENT_REPORT_METHOD_SET.has(method)) {
    throw badRequestError("method must be a valid payment method");
  }

  return method as PaymentMethod;
}

export async function requirePaymentReportAccess(
  event: H3Event,
  orderId?: string,
): Promise<void> {
  if (orderId) {
    await requireOrderAccess(
      event,
      orderId,
      "payments:report",
      "You do not have permission to view payments for this order",
    );
    return;
  }

  requirePermission(event, "payments:report");
}
