import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteSupplier } from "../../services/suppliers/delete-supplier";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "suppliers:write");

    await deleteSupplier(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Supplier deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
