import type { Product } from "../../../types";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapProduct } from "./map-product";

export async function getProductById(id: unknown): Promise<Product> {
  const productId = string(id, "Product id");
  const product = await getProductByIdRecord(productId);

  if (!product) {
    throw notFoundError("Product not found");
  }

  return mapProduct(product);
}
