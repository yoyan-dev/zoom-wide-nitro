import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteCustomer } from "../../services/customers/delete-customer";
import { handleRouteError } from "../../utils/handle-route-error";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    await deleteCustomer(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Customer deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
