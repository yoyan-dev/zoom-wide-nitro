import type { Order, Product } from "../../types";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { transitionOrderStatusRecord } from "../../repositories/orders/transition-order-status";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { approveOrderSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { createInventoryLog } from "../inventory/create-inventory-log";
import { getOrderForDecision } from "./get-order-for-decision";
import { mapOrder } from "./map-order";

type OrderApprovalItem = {
  product: Product;
  quantity: number;
  currentStock: number;
};

export async function approveOrder(
  id: unknown,
  input: unknown,
): Promise<Order> {
  const parsedInput = approveOrderSchema.safeParse(input ?? {});

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const mappedOrder = await getOrderForDecision(id);
  const orderId = mappedOrder.id;

  if (mappedOrder.items.length === 0) {
    throw badRequestError("Order must contain at least one item");
  }

  const aggregatedQuantities = new Map<string, number>();

  for (const item of mappedOrder.items) {
    if (item.quantity <= 0) {
      throw badRequestError(`Invalid quantity for product: ${item.product_id}`);
    }

    aggregatedQuantities.set(
      item.product_id,
      (aggregatedQuantities.get(item.product_id) ?? 0) + item.quantity,
    );
  }

  const approvalItems: OrderApprovalItem[] = [];

  for (const [productId, quantity] of aggregatedQuantities.entries()) {
    const product = await getProductByIdRecord(productId);

    if (!product) {
      throw notFoundError(`Product not found: ${productId}`);
    }

    if (product.is_active === false) {
      throw badRequestError(`Product is inactive: ${productId}`);
    }

    const stockQuantity = product.stock_quantity ?? 0;

    if (stockQuantity < quantity) {
      throw badRequestError(`Insufficient stock for product: ${productId}`);
    }

    approvalItems.push({
      product,
      quantity,
      currentStock: stockQuantity,
    });
  }

  const appliedItems: OrderApprovalItem[] = [];

  try {
    for (const item of approvalItems) {
      await createInventoryLog({
        product_id: item.product.id as string,
        movement_type: "out",
        quantity_change: item.quantity,
        reference_type: "order",
        reference_id: orderId,
        note: `Order approved: ${orderId}`,
        created_by: parsedInput.data.approved_by ?? null,
      });

      appliedItems.push(item);
    }

    const approvedOrder = await transitionOrderStatusRecord(orderId, {
      currentStatus: "pending",
      nextStatus: "approved",
      approvedBy: parsedInput.data.approved_by ?? null,
      rejectionReason: null,
    });

    if (!approvedOrder) {
      const latestOrder = await getOrderByIdRecord(orderId);

      if (!latestOrder) {
        throw notFoundError("Order not found");
      }

      throw badRequestError("Only pending orders can be reviewed");
    }

    return mapOrder(approvedOrder);
  } catch (error) {
    for (const item of appliedItems.reverse()) {
      try {
        const latestProduct = await getProductByIdRecord(
          item.product.id as string,
        );

        if (!latestProduct) {
          continue;
        }

        const latestStock = latestProduct.stock_quantity ?? 0;
        const expectedStock = item.currentStock - item.quantity;

        if (latestStock !== expectedStock) {
          continue;
        }

        await createInventoryLog({
          product_id: item.product.id as string,
          movement_type: "in",
          quantity_change: item.quantity,
          reference_type: "order",
          reference_id: orderId,
          note: `Order approval rollback: ${orderId}`,
          created_by: parsedInput.data.approved_by ?? null,
        });
      } catch {
        // Best-effort rollback only. Preserve the original approval error.
      }
    }

    throw error;
  }
}
