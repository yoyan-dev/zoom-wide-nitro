import type { Order, Product } from "../../../types";
import { getCustomerByIdRecord } from "../../repositories/customers/get-customer-by-id";
import { createOrderRecord } from "../../repositories/orders/create-order";
import { createOrderItemsRecord } from "../../repositories/orders/create-order-items";
import { deleteOrderRecord } from "../../repositories/orders/delete-order";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { badRequestError, notFoundError } from "../../utils/errors";
import { mapOrder } from "./map-order";

type PendingOrderItemInput = {
  product_id: string;
  quantity: number;
};

type ValidatedPendingOrderItem = {
  product: Product;
  quantity: number;
};

export type CreatePendingOrderInput = {
  customer_id: string;
  notes?: string | null;
  items: PendingOrderItemInput[];
  requireSufficientStock?: boolean;
};

function assertProductReady(product: Product | null, productId: string): Product {
  if (!product) {
    throw notFoundError(`Product not found: ${productId}`);
  }

  if (product.is_active === false) {
    throw badRequestError(`Product is inactive: ${productId}`);
  }

  if (typeof product.price !== "number") {
    throw badRequestError(`Product price is not available: ${productId}`);
  }

  return product;
}

function assertValidQuantity(quantity: number, productId: string) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw badRequestError(`Quantity must be greater than zero: ${productId}`);
  }
}

export async function createPendingOrder(
  input: CreatePendingOrderInput,
): Promise<Order> {
  const customer = await getCustomerByIdRecord(input.customer_id);

  if (!customer) {
    throw notFoundError("Customer not found");
  }

  if (input.items.length === 0) {
    throw badRequestError("Order must contain at least one item");
  }

  const aggregatedQuantities = new Map<string, number>();

  for (const item of input.items) {
    assertValidQuantity(item.quantity, item.product_id);

    aggregatedQuantities.set(
      item.product_id,
      (aggregatedQuantities.get(item.product_id) ?? 0) + item.quantity,
    );
  }

  const validatedItems: ValidatedPendingOrderItem[] = [];

  for (const [productId, quantity] of aggregatedQuantities.entries()) {
    const product = assertProductReady(
      await getProductByIdRecord(productId),
      productId,
    );

    const availableStock = product.stock_quantity ?? 0;

    if (input.requireSufficientStock && availableStock < quantity) {
      throw badRequestError(`Insufficient stock for product: ${productId}`);
    }

    validatedItems.push({
      product,
      quantity,
    });
  }

  const totalAmount = validatedItems.reduce(
    (sum, item) => sum + item.quantity * (item.product.price as number),
    0,
  );

  const order = await createOrderRecord({
    customer_id: customer.id,
    status: "pending",
    total_amount: totalAmount,
    notes: input.notes ?? null,
    approved_by: null,
    rejection_reason: null,
  });

  try {
    await createOrderItemsRecord(
      validatedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id as string,
        quantity: item.quantity,
        unit_price: item.product.price as number,
        line_total: item.quantity * (item.product.price as number),
      })),
    );
  } catch (error) {
    await deleteOrderRecord(order.id);
    throw error;
  }

  const createdOrder = await getOrderByIdRecord(order.id);

  if (!createdOrder) {
    throw badRequestError("Created order could not be loaded");
  }

  return mapOrder(createdOrder);
}
