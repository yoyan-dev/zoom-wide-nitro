import type { InventoryMovementResult } from "../../../types";
import { createInventoryLogRecord } from "../../repositories/inventory/create-inventory-log";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { updateProductRecord } from "../../repositories/products/update-product";
import { createInventoryLogSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { mapStockViewItem } from "./map-stock-view-item";

export async function createInventoryLog(
  input: unknown,
): Promise<InventoryMovementResult> {
  const parsedBody = createInventoryLogSchema.safeParse(input);

  if (!parsedBody.success) {
    throw badRequestError(parsedBody.error.message);
  }

  const product = await getProductByIdRecord(parsedBody.data.product_id);

  if (!product) {
    throw notFoundError("Product not found");
  }

  const currentStock = product.stock_quantity ?? 0;
  const signedQuantityChange =
    parsedBody.data.movement_type === "out"
      ? -parsedBody.data.quantity_change
      : parsedBody.data.quantity_change;
  const nextStock = currentStock + signedQuantityChange;

  if (nextStock < 0) {
    throw badRequestError("Inventory movement would result in negative stock");
  }

  const updatedProduct = await updateProductRecord(product.id ?? "", {
    stock_quantity: nextStock,
  });

  if (!updatedProduct) {
    throw notFoundError("Product not found");
  }

  const log = await createInventoryLogRecord({
    ...parsedBody.data,
    quantity_change: parsedBody.data.quantity_change,
  });

  return {
    log,
    stock: mapStockViewItem(updatedProduct),
  };
}
