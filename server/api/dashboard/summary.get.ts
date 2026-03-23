import { defineEventHandler } from "h3";
import { getDashboardSummary } from "../../services/dashboard/get-dashboard-summary";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { summary } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "dashboard:read");

    const dashboardSummary = await getDashboardSummary();

    return summary(dashboardSummary);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
