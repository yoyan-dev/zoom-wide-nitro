import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateSupplier } from "../../services/suppliers/update-supplier";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    // requirePermission(event, "suppliers:write");

    const supplier = await updateSupplier({
      id: getRouterParam(event, "id"),
      input: await readBody(event),
    });

    return ok(supplier, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
