import type { Product } from "../../../types";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

export async function getValidCartProduct(id: unknown): Promise<Product> {
  const productId = string(id, "product_id");
  const product = await getProductByIdRecord(productId);

  if (!product) {
    throw notFoundError("Product not found");
  }

  if (product.is_active === false) {
    throw badRequestError("Product is inactive");
  }

  if (typeof product.price !== "number") {
    throw badRequestError("Product price is not available");
  }

  return product;
}
