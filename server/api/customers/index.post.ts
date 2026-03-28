import { defineEventHandler, setResponseStatus } from "h3";
import { createCustomer } from "../../services/customers/create-customer";
import { readCustomerAccountInput } from "../../utils/account-form-data";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "customers:write");

    const customer = await createCustomer(await readCustomerAccountInput(event));

    setResponseStatus(event, 201);
    return created(customer, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
