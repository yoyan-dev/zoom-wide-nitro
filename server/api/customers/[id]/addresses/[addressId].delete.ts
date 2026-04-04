import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteCustomerAddress } from "../../../../services/addresses/delete-customer-address";
import { requireCustomerAccess } from "../../../../services/customers/require-customer-access";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { noContent } from "../../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const customerId = getRouterParam(event, "id");

    await requireCustomerAccess(event, customerId, "customers:write");

    await deleteCustomerAddress({
      customerId,
      addressId: getRouterParam(event, "addressId"),
    });

    setResponseStatus(event, 204);
    return noContent("Address deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
