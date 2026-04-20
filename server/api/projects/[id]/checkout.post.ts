import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { checkoutProject } from "../../../services/project.service";
import { handleRouteError } from "../../../utils/handle-route-error";
import { created } from "../../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const order = await checkoutProject(event, getRouterParam(event, "id"));

    setResponseStatus(event, 201);
    return created(order, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
