import { defineEventHandler, readBody } from "h3";
import { refreshAuthSession } from "../../services/auth/refresh";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const auth = await refreshAuthSession(await readBody(event));

    return ok(auth, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
