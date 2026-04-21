import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { removeProjectItem } from "../../../../services/project.service";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { noContent } from "../../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    await removeProjectItem(event, {
      projectId: getRouterParam(event, "id"),
      itemId: getRouterParam(event, "itemId"),
    });

    setResponseStatus(event, 204);
    return noContent("Project item removed");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
