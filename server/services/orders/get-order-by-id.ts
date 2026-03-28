import type { Order } from "../../types";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapOrder } from "./map-order";

export async function getOrderById(id: unknown): Promise<Order> {
  const orderId = string(id, "Order id");
  const order = await getOrderByIdRecord(orderId);

  if (!order) {
    throw notFoundError("Order not found");
  }

  return mapOrder(order);
}
