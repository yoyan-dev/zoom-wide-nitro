import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteSupplierAccount } from "../../services/supplier.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      "admin",
      "Only admin users can delete supplier accounts",
    );

    await deleteSupplierAccount(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Supplier deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
