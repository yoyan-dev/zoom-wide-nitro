import { createError, type H3Event } from "h3";
import type { Payment } from "../../shared/types";
import type { RecordPaymentPayload } from "../types";
import { getOrderById } from "../repositories/order.repo";
import {
  createPayment,
  listPaymentsByOrderId,
} from "../repositories/payment.repo";
import { assertExists, getSupabaseClient } from "../utils/supabase";

export async function listOrderPaymentsService(
  event: H3Event,
  orderId: string,
): Promise<Payment[]> {
  return listPaymentsByOrderId(getSupabaseClient(event), orderId);
}

export async function recordPaymentService(
  event: H3Event,
  payload: RecordPaymentPayload,
): Promise<Payment> {
  if (!payload.order_id || payload.amount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "order id and a positive amount are required.",
    });
  }

  const supabase = getSupabaseClient(event);
  const order = await getOrderById(supabase, payload.order_id);
  assertExists(order, "Order not found.");

  return createPayment(supabase, {
    order_id: payload.order_id,
    amount: payload.amount,
    method: payload.method,
    status: payload.status ?? "pending",
    transaction_ref: payload.transaction_ref ?? null,
    paid_at: payload.paid_at ?? null,
  });
}
