import { defineEventHandler } from "h3";
import { getStockSummary } from "../../services/inventory/get-stock-summary";
import { requireInventoryReportAccess } from "../../services/inventory/inventory-reporting";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { summary } from "../../utils/response";
import { optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    requireInventoryReportAccess(event);

    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      product_id: (value) =>
        optional(value, (current) => string(current, "product_id")),
    });

    const result = await getStockSummary({
      q: query.q,
      product_id: query.product_id,
    });

    return summary(result);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
