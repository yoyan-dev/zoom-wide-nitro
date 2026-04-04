import { defineEventHandler, getRouterParam, readBody, setResponseStatus } from "h3";
import { createCustomerAddress } from "../../../../services/addresses/create-customer-address";
import { requireCustomerAccess } from "../../../../services/customers/require-customer-access";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { created } from "../../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const customerId = getRouterParam(event, "id");

    await requireCustomerAccess(event, customerId, "customers:write");

    const address = await createCustomerAddress(customerId, await readBody(event));

    setResponseStatus(event, 201);
    return created(address, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
