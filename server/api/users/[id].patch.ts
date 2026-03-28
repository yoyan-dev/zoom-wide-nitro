import { defineEventHandler, getRouterParam } from "h3";
import { updateInternalUser } from "../../services/users/update-internal-user";
import { readUserAccountInput } from "../../utils/account-form-data";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, "admin", "Only admin users can update internal user accounts");

    const user = await updateInternalUser({
      id: getRouterParam(event, "id"),
      input: await readUserAccountInput(event),
    });

    return ok(user, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
