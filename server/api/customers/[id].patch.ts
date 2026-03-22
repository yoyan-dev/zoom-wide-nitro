import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateCustomer } from "../../services/customers/update-customer";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const customer = await updateCustomer({
      id: getRouterParam(event, "id"),
      input: await readBody(event),
    });

    return ok(customer, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
