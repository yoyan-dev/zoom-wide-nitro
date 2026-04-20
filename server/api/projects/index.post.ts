import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createProject } from "../../services/project.service";
import { handleRouteError } from "../../utils/handle-route-error";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const project = await createProject(event, await readBody(event));

    setResponseStatus(event, 201);
    return created(project, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
