import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteSupplier } from "../../services/suppliers/delete-supplier";
import { handleRouteError } from "../../utils/handle-route-error";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    await deleteSupplier(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Supplier deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
