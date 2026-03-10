import { createError, type H3Event } from "h3";
import type { Order, OrderItem, Product } from "../../shared/types";
import type { CreateOrderPayload } from "../types";
import { getCustomerById } from "../repositories/customer.repo";
import {
  createOrder,
  createOrderItems,
  getOrderById,
  listOrderItems,
  listOrders,
  updateOrder,
} from "../repositories/order.repo";
import { getProductsByIds } from "../repositories/product.repo";
import { consumeStockForOrderService } from "./inventory.service";
import { assertExists, getSupabaseClient } from "../utils/supabase";

export interface OrderDetail extends Order {
  items: OrderItem[];
}

function validateCreateOrderPayload(payload: CreateOrderPayload): void {
  if (
    !payload.customer_id ||
    !Array.isArray(payload.items) ||
    !payload.items.length
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "customer id and at least one order item are required.",
    });
  }

  for (const item of payload.items) {
    if (
      !item.product_id ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Each order item must include product_id and positive quantity.",
      });
    }
  }
}

function mapProductsById(products: Product[]): Map<string, Product> {
  return new Map(products.map((product) => [product.id, product]));
}

export async function listOrdersService(event: H3Event): Promise<Order[]> {
  return listOrders(getSupabaseClient(event));
}

export async function getOrderService(
  event: H3Event,
  orderId: string,
): Promise<OrderDetail> {
  const supabase = getSupabaseClient(event);
  const order = await getOrderById(supabase, orderId);
  const safeOrder = assertExists(order, "Order not found.");
  const items = await listOrderItems(supabase, safeOrder.id);

  return {
    ...safeOrder,
    items,
  };
}

export async function createOrderService(
  event: H3Event,
  payload: CreateOrderPayload,
): Promise<OrderDetail> {
  validateCreateOrderPayload(payload);

  const supabase = getSupabaseClient(event);
  const customer = await getCustomerById(supabase, payload.customer_id);
  assertExists(customer, "Customer not found.");

  const requestedProductIds = [
    ...new Set(payload.items.map((item) => item.product_id)),
  ];
  const products = await getProductsByIds(supabase, requestedProductIds);
  const productsById = mapProductsById(products);

  let totalAmount = 0;
  for (const item of payload.items) {
    const product = productsById.get(item.product_id);
    if (!product) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid product id: ${item.product_id}`,
      });
    }

    if (!product.is_active) {
      throw createError({
        statusCode: 400,
        statusMessage: `Product ${product.name} is inactive.`,
      });
    }

    if (item.quantity > product.stock_quantity) {
      throw createError({
        statusCode: 400,
        statusMessage: `Insufficient stock for ${product.name}.`,
      });
    }

    totalAmount += Number(product.price) * item.quantity;
  }

  const order = await createOrder(supabase, {
    customer_id: payload.customer_id,
    status: "pending",
    total_amount: Number(totalAmount.toFixed(2)),
    notes: payload.notes ?? null,
  });

  await createOrderItems(
    supabase,
    payload.items.map((item) => {
      const product = productsById.get(item.product_id);
      const unitPrice = Number(product?.price ?? 0);

      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: Number((unitPrice * item.quantity).toFixed(2)),
      };
    }),
  );

  return getOrderService(event, order.id);
}

export async function approveOrderService(
  event: H3Event,
  orderId: string,
  approvedBy?: string,
): Promise<OrderDetail> {
  const supabase = getSupabaseClient(event);
  const order = await getOrderById(supabase, orderId);
  const safeOrder = assertExists(order, "Order not found.");

  if (safeOrder.status !== "pending") {
    throw createError({
      statusCode: 400,
      statusMessage: "Only pending orders can be approved.",
    });
  }

  const items = await listOrderItems(supabase, orderId);
  if (!items.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order has no items.",
    });
  }

  await consumeStockForOrderService(
    event,
    orderId,
    items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
    approvedBy ?? null,
  );

  await updateOrder(supabase, orderId, {
    status: "approved",
    approved_by: approvedBy ?? null,
    rejection_reason: null,
  });

  return getOrderService(event, orderId);
}

export async function rejectOrderService(
  event: H3Event,
  orderId: string,
  reason: string,
  rejectedBy?: string,
): Promise<OrderDetail> {
  if (!reason) {
    throw createError({
      statusCode: 400,
      statusMessage: "rejection reason is required.",
    });
  }

  const supabase = getSupabaseClient(event);
  const order = await getOrderById(supabase, orderId);
  const safeOrder = assertExists(order, "Order not found.");

  if (safeOrder.status !== "pending") {
    throw createError({
      statusCode: 400,
      statusMessage: "Only pending orders can be rejected.",
    });
  }

  await updateOrder(supabase, orderId, {
    status: "rejected",
    approved_by: rejectedBy ?? null,
    rejection_reason: reason,
  });

  return getOrderService(event, orderId);
}
