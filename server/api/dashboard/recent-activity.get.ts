import { defineEventHandler } from "h3";
import { getDashboardRecentActivity } from "../../services/dashboard/get-dashboard-recent-activity";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { parseQuery } from "../../utils/query";
import { ok } from "../../utils/response";
import { number, optional } from "../../utils/validator";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "dashboard:read");

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
