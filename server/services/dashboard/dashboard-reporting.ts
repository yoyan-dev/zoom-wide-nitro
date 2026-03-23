import type { H3Event } from "h3";
import { requirePermission } from "../../utils/permissions";

export function requireDashboardReportAccess(event: H3Event): void {
  requirePermission(event, "dashboard:read");
}
