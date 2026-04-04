import { defineEventHandler, getRouterParam } from "h3";
import { getCustomerAddressById } from "../../../../services/addresses/get-customer-address-by-id";
import { requireCustomerAccess } from "../../../../services/customers/require-customer-access";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { ok } from "../../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const customerId = getRouterParam(event, "id");

    await requireCustomerAccess(event, customerId, "customers:read");

    const address = await getCustomerAddressById({
      customerId,
      addressId: getRouterParam(event, "addressId"),
    });

    return ok(address, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
