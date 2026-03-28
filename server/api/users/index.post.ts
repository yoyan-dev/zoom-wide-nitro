import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createInternalUser } from "../../services/users/create-internal-user";
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

    const user = await createInternalUser(await readBody(event));

    setResponseStatus(event, 201);
    return created(user, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
