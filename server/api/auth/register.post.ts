import { defineEventHandler, setResponseStatus } from "h3";
import { registerCustomer } from "../../services/auth/register-customer";
import { readCustomerRegisterInput } from "../../utils/account-form-data";
import { handleRouteError } from "../../utils/handle-route-error";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const auth = await registerCustomer(await readCustomerRegisterInput(event));

    setResponseStatus(event, 201);
    return created(auth, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
