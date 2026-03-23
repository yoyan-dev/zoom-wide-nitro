import {
  defineEventHandler,
  getRouterParam,
} from "h3";
import { getCategoryById } from "../../services/categories/get-category-by-id";
import { handleRouteError } from "../../utils/handle-route-error";
import { ok } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const category = await getCategoryById(getRouterParam(event, "id"));

    return ok(category, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
