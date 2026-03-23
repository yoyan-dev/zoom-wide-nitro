import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updatePaymentStatus } from "../../services/payments/update-payment-status";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const payment = await updatePaymentStatus(
      getRouterParam(event, "id"),
      await readBody(event),
    );

    return ok(payment, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
