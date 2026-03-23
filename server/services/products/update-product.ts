import type { Product } from "../../../types";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { updateProductRecord } from "../../repositories/products/update-product";
import { updateProductSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapProduct } from "./map-product";
import { validateProductReferences } from "./validate-product-references";

type UpdateProductParams = {
  id: unknown;
  input: unknown;
};

export async function updateProduct(
  params: UpdateProductParams,
): Promise<Product> {
  const productId = string(params.id, "Product id");
  const parsedInput = updateProductSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    const existingProduct = await getProductByIdRecord(productId);

    if (!existingProduct) {
      throw notFoundError("Product not found");
    }

    return mapProduct(existingProduct);
  }

  await validateProductReferences(parsedInput.data);

  const updatedProduct = await updateProductRecord(productId, parsedInput.data);

  if (!updatedProduct) {
    throw notFoundError("Product not found");
  }

  return mapProduct(updatedProduct);
}
