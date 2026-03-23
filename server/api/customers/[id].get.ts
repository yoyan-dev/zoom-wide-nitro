import { defineEventHandler, getRouterParam } from "h3";
import { requireCustomerAccess } from "../../services/customers/require-customer-access";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const customer = await requireCustomerAccess(
      event,
      getRouterParam(event, "id"),
      "customers:read",
    );

    return ok(customer, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
