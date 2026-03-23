import { defineEventHandler } from "h3";
import { listCustomers } from "../../services/customers/list-customers";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { parseQuery } from "../../utils/query";
import { paginated } from "../../utils/response";
import { number, optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "customers:read");

    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      page: (value) => optional(value, (current) => number(current, "page")) ?? 1,
      limit: (value) =>
        optional(value, (current) => number(current, "limit")) ?? 10,
    });

    const result = await listCustomers(query);

    return paginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
