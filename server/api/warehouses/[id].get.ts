import { defineEventHandler, getRouterParam } from "h3";
import { getWarehouseById } from "../../services/warehouses/get-warehouse-by-id";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const warehouse = await getWarehouseById(getRouterParam(event, "id"));

    return ok(warehouse, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
