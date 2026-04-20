import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createSupplierAccount } from "../../services/supplier.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      "admin",
      "Only admin users can create supplier accounts",
    );

    const supplier = await createSupplierAccount(await readBody(event));

    setResponseStatus(event, 201);
    return created(supplier, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
