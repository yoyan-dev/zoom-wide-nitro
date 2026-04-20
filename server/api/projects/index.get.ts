import { defineEventHandler } from "h3";
import { listProjects } from "../../services/project.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const projects = await listProjects(event);

    return ok(projects, {
      total: projects.length,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
