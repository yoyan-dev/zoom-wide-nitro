import { deleteProductRecord } from "../../repositories/products/delete-product";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

export async function deleteProduct(id: unknown): Promise<void> {
  const productId = string(id, "Product id");
  const deleted = await deleteProductRecord(productId);

  if (!deleted) {
    throw notFoundError("Product not found");
  }
}
