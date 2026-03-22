import { defineEventHandler, getRouterParam } from "h3";
import { getSupplierById } from "../../services/suppliers/get-supplier-by-id";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const supplier = await getSupplierById(getRouterParam(event, "id"));

    return ok(supplier, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
