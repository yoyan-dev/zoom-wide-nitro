import { defineEventHandler, readBody } from "h3";
import { login } from "../../services/auth/login";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const auth = await login(await readBody(event));

    return ok(auth, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
