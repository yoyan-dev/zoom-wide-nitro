import { defineEventHandler } from "h3";
import { requireCustomerAccess } from "../../services/customers/require-customer-access";
import { listOrders } from "../../services/orders/list-orders";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { parseQuery } from "../../utils/query";
import { paginated } from "../../utils/response";
import { number, optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      status: (value) => optional(value, (current) => string(current, "status")),
      customer_id: (value) =>
        optional(value, (current) => string(current, "customer_id")),
      page: (value) => optional(value, (current) => number(current, "page")) ?? 1,
      limit: (value) =>
        optional(value, (current) => number(current, "limit")) ?? 10,
    });

    if (query.customer_id) {
      await requireCustomerAccess(event, query.customer_id, "orders:read");
    } else {
      requirePermission(event, "orders:read");
    }

    const result = await listOrders(query);

    return paginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
