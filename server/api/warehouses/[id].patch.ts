import {
  defineEventHandler,
  getRouterParam,
  readBody,
} from "h3";
import { updateWarehouse } from "../../services/warehouses/update-warehouse";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const warehouse = await updateWarehouse({
      id: getRouterParam(event, "id"),
      input: await readBody(event),
    });

    return ok(warehouse, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
