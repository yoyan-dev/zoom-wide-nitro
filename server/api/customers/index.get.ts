import { defineEventHandler } from "h3";
import { requireRole } from "../../middleware/admin";
import { listCustomersService } from "../../services/customer.service";

export default defineEventHandler(async (event) => {
  await requireRole(event, ["admin", "manager", "staff", "finance"]);
  return listCustomersService(event);
});
