import { defineEventHandler } from "h3";
import { requireDashboardReportAccess } from "../../services/dashboard/dashboard-reporting";
import { getDashboardRecentActivity } from "../../services/dashboard/get-dashboard-recent-activity";
import { handleRouteError } from "../../utils/handle-route-error";
import { parseQuery } from "../../utils/query";
import { ok } from "../../utils/response";
import { number, optional } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    requireDashboardReportAccess(event);

    const query = parseQuery(event, {
      limit: (value) => optional(value, (current) => number(current, "limit")),
    });

    const recentActivity = await getDashboardRecentActivity({
      limit: query.limit,
    });

    return ok(recentActivity);
  } catch (error) {
    return handleRouteError(event, error);
  }
});
