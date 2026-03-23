import { defineEventHandler } from "h3";
import {
  INVENTORY_MOVEMENT_REPORT_TYPES,
  requireInventoryReportAccess,
} from "../../../services/inventory/inventory-reporting";
import { listInventoryMovements } from "../../../services/inventory/list-inventory-movements";
import { handleRouteError } from "../../../utils/handle-route-error";
import { parseQuery } from "../../../utils/query";
import {
  parseDateRange,
  parseReportPagination,
  parseStatusFilter,
} from "../../../utils/reporting";
import { paginated } from "../../../utils/response";
import { optional, string } from "../../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    requireInventoryReportAccess(event);

    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      product_id: (value) =>
        optional(value, (current) => string(current, "product_id")),
    });
    const movementType = parseStatusFilter(
      event,
      INVENTORY_MOVEMENT_REPORT_TYPES,
      "movement_type",
    );
    const dateRange = parseDateRange(event);
    const pagination = parseReportPagination(event);

    const result = await listInventoryMovements({
      q: query.q,
      product_id: query.product_id,
      movement_type: movementType,
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
