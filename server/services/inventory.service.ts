import { createError, type H3Event } from "h3";
import type { InventoryLog, Product } from "../../shared/types";
import type { LogInventoryMovementPayload } from "../types";
import {
  createInventoryLog,
  getProductForStockUpdate,
  listProductStock,
  updateProductStock,
} from "../repositories/inventory.repo";
import { assertExists, getSupabaseClient } from "../utils/supabase";

export interface InventoryMovementResult {
  product: Product;
  log: InventoryLog;
}

function calculateNextStock(
  movementType: LogInventoryMovementPayload["movement_type"],
  currentStock: number,
  quantityChange: number,
): { nextStock: number; normalizedChange: number } {
  if (quantityChange === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "quantity change must not be 0.",
    });
  }

  if (movementType === "in") {
    const positive = Math.abs(quantityChange);
    return {
      nextStock: currentStock + positive,
      normalizedChange: positive,
    };
  }

  if (movementType === "out") {
    const deduction = Math.abs(quantityChange);
    return {
      nextStock: currentStock - deduction,
      normalizedChange: -deduction,
    };
  }

  return {
    nextStock: currentStock + quantityChange,
    normalizedChange: quantityChange,
  };
}

export async function getStockService(event: H3Event) {
  return listProductStock(getSupabaseClient(event));
}

export async function logMovementService(
  event: H3Event,
  payload: LogInventoryMovementPayload,
): Promise<InventoryMovementResult> {
  const supabase = getSupabaseClient(event);
  const product = await getProductForStockUpdate(supabase, payload.product_id);
  const safeProduct = assertExists(product, "Product not found.");

  const { nextStock, normalizedChange } = calculateNextStock(
    payload.movement_type,
    safeProduct.stock_quantity,
    payload.quantity_change,
  );

  if (nextStock < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Stock cannot go below zero.",
    });
  }

  const updatedProduct = await updateProductStock(
    supabase,
    safeProduct.id,
    nextStock,
  );
  const safeUpdatedProduct = assertExists(updatedProduct, "Product not found.");

  const log = await createInventoryLog(supabase, {
    product_id: safeProduct.id,
    movement_type: payload.movement_type,
    quantity_change: normalizedChange,
    reference_type: payload.reference_type ?? null,
    reference_id: payload.reference_id ?? null,
    note: payload.note ?? null,
    created_by: payload.created_by ?? null,
  });

  return {
    product: safeUpdatedProduct,
    log,
  };
}

export async function consumeStockForOrderService(
  event: H3Event,
  orderId: string,
  orderItems: { product_id: string; quantity: number }[],
  createdBy?: string | null,
): Promise<void> {
  for (const item of orderItems) {
    await logMovementService(event, {
      product_id: item.product_id,
      movement_type: "out",
      quantity_change: item.quantity,
      reference_type: "order",
      reference_id: orderId,
      note: "Stock deducted after order approval.",
      created_by: createdBy ?? null,
    });
  }
}
