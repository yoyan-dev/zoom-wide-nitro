import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createPayment } from "../../services/payments/create-payment";
import { handleRouteError } from "../../utils/handle-route-error";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const payment = await createPayment(await readBody(event));

    setResponseStatus(event, 201);
    return created(payment, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
