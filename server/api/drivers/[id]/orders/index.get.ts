import { defineEventHandler, getRouterParam } from "h3";
import { listDeliveries } from "../../../../services/deliveries/list-deliveries";
import {
  DELIVERY_REPORT_STATUSES,
} from "../../../../services/deliveries/delivery-reporting";
import { requireDriverAccess } from "../../../../services/drivers/require-driver-access";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { parseQuery } from "../../../../utils/query";
import {
  parseDateRange,
  parseReportPagination,
  parseStatusFilter,
} from "../../../../utils/reporting";
import { paginated } from "../../../../utils/response";
import { optional, string } from "../../../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const driver = await requireDriverAccess(event, getRouterParam(event, "id"));
    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
    });
    const status = parseStatusFilter(event, DELIVERY_REPORT_STATUSES);
    const dateRange = parseDateRange(event);
    const pagination = parseReportPagination(event);

    const result = await listDeliveries({
      q: query.q,
      status,
      driver_id: driver.id,
      from: dateRange.from,
      to: dateRange.to,
      page: pagination.page,
      limit: pagination.limit,
    });

    return paginated(
      result.data.map((delivery) => ({
        order: delivery.order ?? null,
        delivery,
      })),
      result.meta,
    );
  } catch (error) {
    return handleRouteError(event, error);
  }
});
