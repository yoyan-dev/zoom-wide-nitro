import { defineEventHandler, readBody } from "h3";
import { logout } from "../../services/auth/logout";
import { extractBearerToken } from "../../utils/auth";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const result = await logout({
      accessToken: extractBearerToken(event),
      body: await readBody(event),
    });

    return ok(result, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
