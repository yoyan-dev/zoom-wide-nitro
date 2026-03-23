import { defineEventHandler } from "h3";
import { listPayments } from "../../services/payments/list-payments";
import {
  PAYMENT_REPORT_METHODS,
  PAYMENT_REPORT_STATUSES,
  requirePaymentReportAccess,
} from "../../services/payments/payment-reporting";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import {
  parseDateRange,
  parseReportPagination,
  parseStatusFilter,
} from "../../utils/reporting";
import { paginated } from "../../utils/response";
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
    const pagination = parseReportPagination(event);

    await requirePaymentReportAccess(event, query.order_id);

    const result = await listPayments({
      q: query.q,
      status,
      method,
      order_id: query.order_id,
      from: dateRange.from,
      to: dateRange.to,
      page: pagination.page,
      limit: pagination.limit,
    });

    return paginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
