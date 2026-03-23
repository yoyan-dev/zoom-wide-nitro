import { defineEventHandler } from "h3";
import { getDeliverySummary } from "../../services/deliveries/get-delivery-summary";
import {
  DELIVERY_REPORT_STATUSES,
  requireDeliveryReportAccess,
} from "../../services/deliveries/delivery-reporting";
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
      driver_id: (value) =>
        optional(value, (current) => string(current, "driver_id")),
    });
    const status = parseStatusFilter(event, DELIVERY_REPORT_STATUSES);
    const dateRange = parseDateRange(event);

    await requireDeliveryReportAccess(event, {
      orderId: query.order_id,
      driverId: query.driver_id,
    });

    const result = await getDeliverySummary({
      q: query.q,
      status,
      order_id: query.order_id,
      driver_id: query.driver_id,
      from: dateRange.from,
      to: dateRange.to,
    });

    return summary(result);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
