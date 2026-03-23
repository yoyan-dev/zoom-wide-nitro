import { defineEventHandler } from "h3";
import { getStockView } from "../../services/inventory/get-stock-view";
import {
  INVENTORY_STOCK_STATUSES,
  requireInventoryReportAccess,
} from "../../services/inventory/inventory-reporting";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { parseReportPagination, parseStatusFilter } from "../../utils/reporting";
import { paginated } from "../../utils/response";
import { optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    requireInventoryReportAccess(event);

    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      product_id: (value) =>
        optional(value, (current) => string(current, "product_id")),
    });
    const stockStatus = parseStatusFilter(
      event,
      INVENTORY_STOCK_STATUSES,
      "stock_status",
    );
    const pagination = parseReportPagination(event);

    const result = await getStockView({
      q: query.q,
      product_id: query.product_id,
      stock_status: stockStatus,
      page: pagination.page,
      limit: pagination.limit,
    });

    return paginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
