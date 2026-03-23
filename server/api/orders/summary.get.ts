import { defineEventHandler } from "h3";
import { getOrderSummary } from "../../services/orders/get-order-summary";
import {
  ORDER_REPORT_STATUSES,
  requireOrderReportAccess,
} from "../../services/orders/order-reporting";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { parseDateRange, parseStatusFilter } from "../../utils/reporting";
import { summary } from "../../utils/response";
import { optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      customer_id: (value) =>
        optional(value, (current) => string(current, "customer_id")),
    });
    const status = parseStatusFilter(event, ORDER_REPORT_STATUSES);
    const dateRange = parseDateRange(event);

    await requireOrderReportAccess(event, query.customer_id);

    const result = await getOrderSummary({
      q: query.q,
      status,
      customer_id: query.customer_id,
      from: dateRange.from,
      to: dateRange.to,
    });

    return summary(result);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
