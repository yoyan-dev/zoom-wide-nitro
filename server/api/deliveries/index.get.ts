import { defineEventHandler } from "h3";
import { listDeliveries } from "../../services/deliveries/list-deliveries";
import {
  DELIVERY_REPORT_STATUSES,
  requireDeliveryReportAccess,
} from "../../services/deliveries/delivery-reporting";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { parseDateRange, parseReportPagination, parseStatusFilter } from "../../utils/reporting";
import { paginated } from "../../utils/response";
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
    const pagination = parseReportPagination(event);

    await requireDeliveryReportAccess(event, {
      orderId: query.order_id,
      driverId: query.driver_id,
    });

    const result = await listDeliveries({
      q: query.q,
      status,
      order_id: query.order_id,
      driver_id: query.driver_id,
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
