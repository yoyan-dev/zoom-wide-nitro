import { defineEventHandler } from "h3";
import { requireDashboardReportAccess } from "../../services/dashboard/dashboard-reporting";
import { getDashboardSummary } from "../../services/dashboard/get-dashboard-summary";
import { handleRouteError } from "../../utils/handle-route-error";
import { summary } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requireDashboardReportAccess(event);

    const dashboardSummary = await getDashboardSummary();

    return summary(dashboardSummary);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
