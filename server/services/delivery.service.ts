import { createError, type H3Event } from "h3";
import type { Delivery } from "../../shared/types";
import type { CreateDeliveryPayload, UpdateDeliveryStatusPayload } from "../types";
import {
  createDelivery,
  getDeliveryById,
  getDeliveryByOrderId,
  listDeliveries,
  updateDelivery,
} from "../repositories/delivery.repo";
import { getOrderById, updateOrder } from "../repositories/order.repo";
import { assertExists, getSupabaseClient } from "../utils/supabase";

export async function listDeliveriesService(event: H3Event): Promise<Delivery[]> {
  return listDeliveries(getSupabaseClient(event));
}

export async function createDeliveryService(
  event: H3Event,
  payload: CreateDeliveryPayload
): Promise<Delivery> {
  if (!payload.order_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "order_id is required.",
    });
  }

  const supabase = getSupabaseClient(event);
  const order = await getOrderById(supabase, payload.order_id);
  const safeOrder = assertExists(order, "Order not found.");

  if (safeOrder.status !== "approved") {
    throw createError({
      statusCode: 400,
      statusMessage: "Delivery can only be created for approved orders.",
    });
  }

  const existing = await getDeliveryByOrderId(supabase, payload.order_id);
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: "Delivery already exists for this order.",
    });
  }

  return createDelivery(supabase, {
    order_id: payload.order_id,
    driver_name: payload.driver_name ?? null,
    vehicle_number: payload.vehicle_number ?? null,
    scheduled_at: payload.scheduled_at ?? null,
    status: "scheduled",
  });
}

export async function updateDeliveryStatusService(
  event: H3Event,
  payload: UpdateDeliveryStatusPayload
): Promise<Delivery> {
  const supabase = getSupabaseClient(event);
  const delivery = await getDeliveryById(supabase, payload.delivery_id);
  const safeDelivery = assertExists(delivery, "Delivery not found.");

  const updated = await updateDelivery(supabase, safeDelivery.id, {
    status: payload.status,
    delivered_at:
      payload.status === "delivered"
        ? payload.delivered_at ?? new Date().toISOString()
        : null,
  });
  const safeUpdated = assertExists(updated, "Delivery not found.");

  if (payload.status === "delivered") {
    await updateOrder(supabase, safeDelivery.order_id, {
      status: "completed",
    });
  }

  return safeUpdated;
}
