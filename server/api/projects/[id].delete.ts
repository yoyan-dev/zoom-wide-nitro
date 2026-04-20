import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteProject } from "../../services/project.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    await deleteProject(event, getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Project deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
