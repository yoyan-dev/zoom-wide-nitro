import { defineEventHandler, readBody } from "h3";
import { forgotPassword } from "../../services/auth/forgot-password";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const result = await forgotPassword(await readBody(event));

    return ok(result, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
