import type { MultiPartData } from "h3";
import type { Product } from "../../types";
import { createProductRecord } from "../../repositories/products/create-product";
import { createProductSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import {
  getProductImagePart,
  parseProductMultipartFields,
} from "../../utils/resource-form-data";
import { uploadProductImage } from "../../utils/storage";
import { mapProduct } from "./map-product";
import { validateProductReferences } from "./validate-product-references";

export async function createProduct(parts: MultiPartData[]): Promise<Product> {
  let body: ReturnType<typeof parseProductMultipartFields>;
  const imagePart = getProductImagePart(parts);

  try {
    body = parseProductMultipartFields(parts);
  } catch (error) {
    throw badRequestError(
      error instanceof Error ? error.message : "Invalid product form data",
    );
  }

  const parsedBody = createProductSchema.safeParse(body);

  if (!parsedBody.success) {
    throw badRequestError(parsedBody.error.message);
  }

  await validateProductReferences(parsedBody.data);

  const imageUrl = imagePart
    ? await uploadProductImage(imagePart)
    : parsedBody.data.image_url;

  const product = await createProductRecord({
    ...parsedBody.data,
    image_url: imageUrl ?? null,
  });

  return mapProduct(product);
}
