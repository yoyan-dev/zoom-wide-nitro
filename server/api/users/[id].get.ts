import { defineEventHandler, getRouterParam } from "h3";
import { getInternalUserById } from "../../services/users/get-internal-user-by-id";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, "admin", "Only admin users can view internal user accounts");

    const user = await getInternalUserById(getRouterParam(event, "id"));

    return ok(user, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
