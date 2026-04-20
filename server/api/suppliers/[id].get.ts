import { defineEventHandler, getRouterParam } from "h3";
import { getSupplierById } from "../../services/supplier.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      "admin",
      "Only admin users can view supplier accounts",
    );

    const supplier = await getSupplierById(getRouterParam(event, "id"));

    return ok(supplier, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
