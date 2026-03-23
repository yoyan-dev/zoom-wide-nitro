import { defineEventHandler } from "h3";
import { getPaymentSummary } from "../../services/payments/get-payment-summary";
import {
  PAYMENT_REPORT_METHODS,
  PAYMENT_REPORT_STATUSES,
  requirePaymentReportAccess,
} from "../../services/payments/payment-reporting";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { parseDateRange, parseStatusFilter } from "../../utils/reporting";
import { summary } from "../../utils/response";
import { optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      order_id: (value) =>
        optional(value, (current) => string(current, "order_id")),
    });
    const status = parseStatusFilter(event, PAYMENT_REPORT_STATUSES);
    const method = parseStatusFilter(event, PAYMENT_REPORT_METHODS, "method");
    const dateRange = parseDateRange(event);

    await requirePaymentReportAccess(event, query.order_id);

    const result = await getPaymentSummary({
      q: query.q,
      status,
      method,
      order_id: query.order_id,
      from: dateRange.from,
      to: dateRange.to,
    });

    return summary(result);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
