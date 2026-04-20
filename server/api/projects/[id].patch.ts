import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateProject } from "../../services/project.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const project = await updateProject(event, {
      id: getRouterParam(event, "id"),
      input: await readBody(event),
    });

    return ok(project, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
