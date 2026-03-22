import { defineEventHandler, setResponseStatus } from "h3";
import { createProduct } from "../../services/products/create-product";
import { handleRouteError } from "../../utils/handle-route-error";
import { requireMultipartFormData } from "../../utils/multipart";
import { created } from "../../utils/response";

export default defineEventHandler(async (event) => {
  try {
    const formData = await requireMultipartFormData(event, "product creation");
    const product = await createProduct(formData);

    setResponseStatus(event, 201);
    return created(product, {
      total: 1,
    });
  } catch (error) {
    return handleRouteError(event, error);
  }
});
