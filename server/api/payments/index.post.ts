import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { requireOrderAccess } from "../../services/orders/require-order-access";
import { createPayment } from "../../services/payments/create-payment";
import { handleRouteError } from "../../utils/handle-route-error";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    await requireOrderAccess(
      event,
      (body as { order_id?: unknown })?.order_id,
      "payments:write",
      "You do not have permission to create a payment for this order",
    );

    const payment = await createPayment(body);

    setResponseStatus(event, 201);
    return created(payment, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
