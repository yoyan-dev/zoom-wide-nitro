import { defineEventHandler, setResponseStatus } from "h3";
import { createDriverAccount } from "../../services/drivers/create-driver-account";
import { readDriverAccountInput } from "../../utils/account-form-data";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireRole } from "../../utils/permissions";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireRole(
      event,
      ["admin", "staff"],
      "Only admin or staff users can create driver accounts",
    );

    const driver = await createDriverAccount(await readDriverAccountInput(event));

    setResponseStatus(event, 201);
    return created(driver, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
