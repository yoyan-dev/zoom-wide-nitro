import {
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { createCategory } from "../../services/categories/create-category";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireMultipartFormData } from "../../utils/multipart";
import { requirePermission } from "../../utils/permissions";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    requirePermission(event, "categories:write");

    const formData = await requireMultipartFormData(event, "category creation");
    const category = await createCategory(formData);

    setResponseStatus(event, 201);
    return created(category, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
