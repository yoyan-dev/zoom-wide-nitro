import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateProjectItemQuantity } from "../../../../services/project.service";
import { handleRouteError } from "../../../../utils/handle-route-error";
import { ok } from "../../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const item = await updateProjectItemQuantity(event, {
      projectId: getRouterParam(event, "id"),
      itemId: getRouterParam(event, "itemId"),
      input: await readBody(event),
    });

    return ok(item, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
