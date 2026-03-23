import { defineEventHandler } from "h3";
import { getStockView } from "../../services/inventory/get-stock-view";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { parseQuery } from "../../utils/query";
import { paginated } from "../../utils/response";
import { number, optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "inventory:read");

    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      product_id: (value) =>
        optional(value, (current) => string(current, "product_id")),
      page: (value) => optional(value, (current) => number(current, "page")) ?? 1,
      limit: (value) =>
        optional(value, (current) => number(current, "limit")) ?? 10,
    });

    const result = await getStockView(query);

    return paginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
