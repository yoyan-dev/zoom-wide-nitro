import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateCustomerAddress } from "../../../../services/addresses/update-customer-address";
import { requireCustomerAccess } from "../../../../services/customers/require-customer-access";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { ok } from "../../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const customerId = getRouterParam(event, "id");

    await requireCustomerAccess(event, customerId, "customers:write");

    const address = await updateCustomerAddress({
      customerId,
      addressId: getRouterParam(event, "addressId"),
      input: await readBody(event),
    });

    return ok(address, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
