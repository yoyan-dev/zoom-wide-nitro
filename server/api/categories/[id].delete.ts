import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteCategory } from "../../services/categories/delete-category";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "categories:write");

    await deleteCategory(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Category deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
