import type { MultiPartData } from "h3";
import type { Product } from "../../../types";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { updateProductRecord } from "../../repositories/products/update-product";
import { updateProductSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import {
  getProductImagePart,
  parseProductMultipartFields,
} from "../../utils/resource-form-data";
import { uploadProductImage } from "../../utils/storage";
import { string } from "../../utils/validator";
import { mapProduct } from "./map-product";
import { validateProductReferences } from "./validate-product-references";

type UpdateProductParams = {
  id: unknown;
  parts: MultiPartData[];
};

export async function updateProduct(
  params: UpdateProductParams,
): Promise<Product> {
  const productId = string(params.id, "Product id");
  let body: ReturnType<typeof parseProductMultipartFields>;
  const imagePart = getProductImagePart(params.parts);

  try {
    body = parseProductMultipartFields(params.parts);
  } catch (error) {
    throw badRequestError(
      error instanceof Error ? error.message : "Invalid product form data",
    );
  }

  const parsedInput = updateProductSchema.safeParse(body);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const existingProduct = await getProductByIdRecord(productId);

  if (!existingProduct) {
    throw notFoundError("Product not found");
  }

  const hasFieldUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );
  const hasUpdates = hasFieldUpdates || !!imagePart;

  if (!hasUpdates) {
    return mapProduct(existingProduct);
  }

  await validateProductReferences(parsedInput.data);

  const imageUrl = imagePart
    ? await uploadProductImage(imagePart)
    : parsedInput.data.image_url;
  const updatedProduct = await updateProductRecord(productId, {
    ...parsedInput.data,
    ...(imagePart ? { image_url: imageUrl ?? null } : {}),
  });

  if (!updatedProduct) {
    throw notFoundError("Product not found");
  }

  return mapProduct(updatedProduct);
}
