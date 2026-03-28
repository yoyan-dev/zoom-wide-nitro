import { defineEventHandler, getRouterParam } from "h3";
import { getDriverById } from "../../services/drivers/get-driver-by-id";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      ["admin", "staff"],
      "Only admin or staff users can view driver accounts",
    );

    const driver = await getDriverById(getRouterParam(event, "id"));

    return ok(driver, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
