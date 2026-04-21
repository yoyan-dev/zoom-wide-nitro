import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateSupplierAccount } from "../../services/supplier.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      "admin",
      "Only admin users can update supplier accounts",
    );

    const supplier = await updateSupplierAccount({
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
