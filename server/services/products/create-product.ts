import type { MultiPartData } from "h3";
import type { Product } from "../../../types";
import { createProductRecord } from "../../repositories/products/create-product";
import { createProductSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { parseProductMultipartFields } from "../../utils/resource-form-data";
import { mapProduct } from "./map-product";
import { validateProductReferences } from "./validate-product-references";

export async function createProduct(parts: MultiPartData[]): Promise<Product> {
  let body: ReturnType<typeof parseProductMultipartFields>;

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

  const product = await createProductRecord(parsedBody.data);

  return mapProduct(product);
}
