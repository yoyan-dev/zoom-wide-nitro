import type { InventoryMovementResult } from "../../types";
import { createInventoryLogRecord } from "../../repositories/inventory/create-inventory-log";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { updateProductRecord } from "../../repositories/products/update-product";
import { createInventoryLogSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { mapStockViewItem } from "./map-stock-view-item";

type MovementComputation = {
  nextStock: number;
  loggedQuantityChange: number;
};

function getMovementComputation(
  movementType: "in" | "out" | "adjustment",
  currentStock: number,
  quantityChange: number,
): MovementComputation {
  if (movementType === "in") {
    return {
      nextStock: currentStock + quantityChange,
      loggedQuantityChange: quantityChange,
    };
  }

  if (movementType === "out") {
    return {
      nextStock: currentStock - quantityChange,
      loggedQuantityChange: quantityChange,
    };
  }

  const nextStock = quantityChange;
  return {
    nextStock,
    loggedQuantityChange: Math.abs(nextStock - currentStock),
  };
}

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
  const { nextStock, loggedQuantityChange } = getMovementComputation(
    parsedBody.data.movement_type,
    currentStock,
    parsedBody.data.quantity_change,
  );

  if (nextStock < 0) {
    throw badRequestError("Inventory movement would result in negative stock");
  }

  if (
    parsedBody.data.movement_type === "adjustment" &&
    nextStock === currentStock
  ) {
    throw badRequestError("Adjustment must change stock");
  }

  const updatedProduct = await updateProductRecord(product.id ?? "", {
    stock_quantity: nextStock,
  });

  if (!updatedProduct) {
    throw notFoundError("Product not found");
  }

  const log = await createInventoryLogRecord({
    ...parsedBody.data,
    quantity_change: loggedQuantityChange,
  });

  return {
    log,
    stock: mapStockViewItem(updatedProduct),
  };
}
