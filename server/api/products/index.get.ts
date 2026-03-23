import { defineEventHandler } from "h3";
import { listProducts } from "../../services/products/list-products";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { paginated } from "../../utils/response";
import { number, optional, string } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    const query = parseQuery(event, {
      q: (value) => optional(value, (current) => string(current, "q")),
      category_id: (value) =>
        optional(value, (current) => string(current, "category_id")),
      supplier_id: (value) =>
        optional(value, (current) => string(current, "supplier_id")),
      page: (value) => optional(value, (current) => number(current, "page")) ?? 1,
      limit: (value) =>
        optional(value, (current) => number(current, "limit")) ?? 10,
    });

    const result = await listProducts(query);

    return paginated(result.data, result.meta);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
