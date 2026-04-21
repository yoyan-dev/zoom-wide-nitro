import { defineEventHandler, getRouterParam, readBody, setResponseStatus } from "h3";
import { addProjectItem } from "../../../services/project.service";
import { handleRouteError } from "../../../utils/handle-route-error";
import { created } from "../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const item = await addProjectItem(event, {
      projectId: getRouterParam(event, "id"),
      input: await readBody(event),
    });

    setResponseStatus(event, 201);
    return created(item, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
