import type { Order, Product } from "../../../types";
import { createInventoryLogRecord } from "../../repositories/inventory/create-inventory-log";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { updateOrderRecord } from "../../repositories/orders/update-order";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { updateProductRecord } from "../../repositories/products/update-product";
import { approveOrderSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapOrder } from "./map-order";

type OrderApprovalItem = {
  product: Product;
  quantity: number;
};

export async function approveOrder(
  id: unknown,
  input: unknown,
): Promise<Order> {
  const parsedInput = approveOrderSchema.safeParse(input ?? {});

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const orderId = string(id, "Order id");

  const order = await getOrderByIdRecord(orderId);

  if (!order) {
    throw notFoundError("Order not found");
  }

  const mappedOrder = mapOrder(order);

  if (mappedOrder.status !== "pending") {
    throw badRequestError("Only pending orders can be approved");
  }

  if (mappedOrder.items.length === 0) {
    throw badRequestError("Order must contain at least one item");
  }

  const approvalItems: OrderApprovalItem[] = [];

  for (const item of mappedOrder.items) {
    const product = await getProductByIdRecord(item.product_id);

    if (!product) {
      throw notFoundError(`Product not found: ${item.product_id}`);
    }

    if (product.is_active === false) {
      throw badRequestError(`Product is inactive: ${item.product_id}`);
    }

    const stockQuantity = product.stock_quantity ?? 0;

    if (stockQuantity < item.quantity) {
      throw badRequestError(`Insufficient stock for product: ${item.product_id}`);
    }

    approvalItems.push({
      product,
      quantity: item.quantity,
    });
  }

  for (const item of approvalItems) {
    const currentStock = item.product.stock_quantity ?? 0;
    const updatedProduct = await updateProductRecord(item.product.id as string, {
      stock_quantity: currentStock - item.quantity,
    });

    if (!updatedProduct) {
      throw notFoundError(`Product not found: ${item.product.id as string}`);
    }

    await createInventoryLogRecord({
      product_id: item.product.id as string,
      movement_type: "out",
      quantity_change: item.quantity,
      reference_type: "order",
      reference_id: orderId,
      note: `Order approved: ${orderId}`,
      created_by: parsedInput.data.approved_by ?? null,
    });
  }

  const approvedOrder = await updateOrderRecord(orderId, {
    status: "approved",
    approved_by: parsedInput.data.approved_by ?? null,
    rejection_reason: null,
  });

  if (!approvedOrder) {
    throw notFoundError("Order not found");
  }

  return mapOrder(approvedOrder);
}
