import { defineEventHandler, readBody } from "h3";
import { requireRole } from "../../middleware/admin";
import { createCustomerService } from "../../services/customer.service";
import type { CreateCustomerPayload } from "../../types";

export default defineEventHandler(async (event) => {
  await requireRole(event, ["admin", "manager", "staff", "customer"]);
  const payload = await readBody<CreateCustomerPayload>(event);
  return createCustomerService(event, payload);
});
