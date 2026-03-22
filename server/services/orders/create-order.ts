import type { Order, Product } from "../../../types";
import { getCustomerByIdRecord } from "../../repositories/customers/get-customer-by-id";
import { createOrderRecord } from "../../repositories/orders/create-order";
import { createOrderItemsRecord } from "../../repositories/orders/create-order-items";
import { deleteOrderRecord } from "../../repositories/orders/delete-order";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { getProductByIdRecord } from "../../repositories/products/get-product-by-id";
import { createOrderRequestSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { mapOrder } from "./map-order";

type CreateOrderItemInput = {
  product: Product;
  quantity: number;
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

export async function createOrder(input: unknown): Promise<Order> {
  const parsedInput = createOrderRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const customer = await getCustomerByIdRecord(parsedInput.data.customer_id);

  if (!customer) {
    throw notFoundError("Customer not found");
  }

  const validatedItems: CreateOrderItemInput[] = [];

  for (const item of parsedInput.data.items) {
    const product = assertProductReady(
      await getProductByIdRecord(item.product_id),
      item.product_id,
    );

    validatedItems.push({
      product,
      quantity: item.quantity,
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
    notes: parsedInput.data.notes ?? null,
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
