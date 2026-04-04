import { defineEventHandler, getRouterParam } from "h3";
import { listCustomerAddresses } from "../../../../services/addresses/list-customer-addresses";
import { requireCustomerAccess } from "../../../../services/customers/require-customer-access";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { parseQuery } from "../../../../utils/query";
import { paginated } from "../../../../utils/response";
import { number, optional, string } from "../../../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const customerId = getRouterParam(event, "id");

    await requireCustomerAccess(event, customerId, "customers:read");

    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      page: (value) => optional(value, (current) => number(current, "page")) ?? 1,
      limit: (value) =>
        optional(value, (current) => number(current, "limit")) ?? 10,
    });

    const result = await listCustomerAddresses({
      customerId,
      ...query,
    });

    return paginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
