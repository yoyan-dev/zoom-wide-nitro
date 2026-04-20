import { defineEventHandler, getRouterParam } from "h3";
import { listProjectItems } from "../../../services/project.service";
import { handleRouteError } from "../../../utils/handle-route-error";
import { ok } from "../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const items = await listProjectItems(event, getRouterParam(event, "id"));

    return ok(items, {
      total: items.length,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
