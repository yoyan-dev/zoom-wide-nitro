import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateCustomer } from "../../services/customers/update-customer";
import { requireCustomerAccess } from "../../services/customers/require-customer-access";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const customerId = getRouterParam(event, "id");

    await requireCustomerAccess(event, customerId, "customers:write");

    const customer = await updateCustomer({
      id: customerId,
      input: await readBody(event),
    });

    return ok(customer, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
