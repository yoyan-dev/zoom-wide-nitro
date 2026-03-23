import { defineEventHandler } from "h3";
import { listWarehouses } from "../../services/warehouses/list-warehouses";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { paginated } from "../../utils/response";
import { number, optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      status: (value) =>
        optional(value, (current) => string(current, "status")),
      page: (value) => optional(value, (current) => number(current, "page")) ?? 1,
      limit: (value) =>
        optional(value, (current) => number(current, "limit")) ?? 10,
    });

    const result = await listWarehouses(query);

    return paginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
