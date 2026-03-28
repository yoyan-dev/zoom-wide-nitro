import { defineEventHandler, getRouterParam } from "h3";
import { updateDriverAccount } from "../../services/drivers/update-driver-account";
import { readDriverAccountInput } from "../../utils/account-form-data";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      ["admin", "staff"],
      "Only admin or staff users can update driver accounts",
    );

    const driver = await updateDriverAccount({
      id: getRouterParam(event, "id"),
      input: await readDriverAccountInput(event),
    });

    return ok(driver, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
