import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createDriverAccount } from "../../services/drivers/create-driver-account";
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

    const driver = await createDriverAccount(await readBody(event));

    setResponseStatus(event, 201);
    return created(driver, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
