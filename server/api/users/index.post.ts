import { defineEventHandler, setResponseStatus } from "h3";
import { createInternalUser } from "../../services/users/create-internal-user";
import { readUserAccountInput } from "../../utils/account-form-data";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      "admin",
      "Only admin users can create internal user accounts",
    );

    const user = await createInternalUser(await readUserAccountInput(event));

    setResponseStatus(event, 201);
    return created(user, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
