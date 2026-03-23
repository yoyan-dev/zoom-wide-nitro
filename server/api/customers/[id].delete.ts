import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteCustomer } from "../../services/customers/delete-customer";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "customers:write");

    await deleteCustomer(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Customer deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
