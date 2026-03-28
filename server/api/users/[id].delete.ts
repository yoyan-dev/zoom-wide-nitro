import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteInternalUser } from "../../services/users/delete-internal-user";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, "admin", "Only admin users can delete internal user accounts");

    await deleteInternalUser(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("User deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
