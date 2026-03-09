import { createError, defineEventHandler, getRouterParam } from "h3";
import { requireRole } from "../../middleware/admin";
import { getCustomerService } from "../../services/customer.service";

export default defineEventHandler(async (event) => {
  await requireRole(event, ["admin", "manager", "staff", "finance", "customer"]);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing customer id.",
    });
  }

  return getCustomerService(event, id);
});
