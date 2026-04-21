import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteDriverAccount } from "../../services/drivers/delete-driver-account";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      "admin",
      "Only admin users can delete driver accounts",
    );

    await deleteDriverAccount(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Driver deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
