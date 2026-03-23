import { defineEventHandler } from "h3";
import { getProductInsights } from "../../services/products/get-product-insights";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { parseQuery } from "../../utils/query";
import { ok } from "../../utils/response";
import { number, optional } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "products:insights");

    const query = parseQuery(event, {
      limit: (value) => optional(value, (current) => number(current, "limit")),
    });

    const insights = await getProductInsights({
      limit: query.limit,
    });

    return ok(insights);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
