import { defineEventHandler, getRouterParam } from "h3";
import { getProject } from "../../services/project.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const project = await getProject(event, getRouterParam(event, "id"));

    return ok(project, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
