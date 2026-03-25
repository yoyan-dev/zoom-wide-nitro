import { defineEventHandler, getRouterParam, readBody } from "h3";
import { updateCategory } from "../../services/categories/update-category";
import { handleRouteError } from "../../utils/handle-route-error";
import { requirePermission } from "../../utils/permissions";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    // requirePermission(event, "categories:write");

    const category = await updateCategory({
      id: getRouterParam(event, "id"),
      input: await readBody(event),
    });

    return ok(category, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
