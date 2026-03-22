import { defineEventHandler, getRouterParam } from "h3";
import { getCustomerById } from "../../services/customers/get-customer-by-id";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const customer = await getCustomerById(getRouterParam(event, "id"));

    return ok(customer, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
