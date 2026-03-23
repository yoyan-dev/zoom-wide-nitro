import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createOrder } from "../../services/orders/create-order";
import { requireCustomerAccess } from "../../services/customers/require-customer-access";
import { handleRouteError } from "../../utils/handle-route-error";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    await requireCustomerAccess(
      event,
      (body as { customer_id?: unknown })?.customer_id,
      "orders:write",
    );

    const order = await createOrder(body);

    setResponseStatus(event, 201);
    return created(order, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
