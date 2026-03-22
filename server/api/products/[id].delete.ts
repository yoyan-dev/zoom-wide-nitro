import { defineEventHandler, getRouterParam, setResponseStatus } from "h3";
import { deleteProduct } from "../../services/products/delete-product";
import { handleRouteError } from "../../utils/handle-route-error";
import { noContent } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    await deleteProduct(getRouterParam(event, "id"));

    setResponseStatus(event, 204);
    return noContent("Product deleted");
  } catch (error) {
    return handleRouteError(event, error);
  }
});
