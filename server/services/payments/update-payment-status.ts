import type { Payment, PaymentStatus } from "../../../types";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { getPaymentByIdRecord } from "../../repositories/payments/get-payment-by-id";
import { transitionPaymentStatusRecord } from "../../repositories/payments/transition-payment-status";
import { updatePaymentStatusSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { requireOrderEligibleForPaymentCompletion } from "../orders/order-workflow-rules";
import { mapPayment } from "./map-payment";

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ["paid", "failed"],
  paid: ["refunded"],
  failed: ["pending", "paid"],
  refunded: [],
};

function canTransitionPaymentStatus(
  currentStatus: PaymentStatus,
  nextStatus: PaymentStatus,
) {
  return PAYMENT_TRANSITIONS[currentStatus].includes(nextStatus);
}

export async function updatePaymentStatus(
  id: unknown,
  input: unknown,
): Promise<Payment> {
  const paymentId = string(id, "Payment id");
  const parsedInput = updatePaymentStatusSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const payment = await getPaymentByIdRecord(paymentId);

  if (!payment) {
    throw notFoundError("Payment not found");
  }

  if (!canTransitionPaymentStatus(payment.status, parsedInput.data.status)) {
    throw badRequestError("Invalid payment status transition");
  }

  if (parsedInput.data.status === "paid") {
    requireOrderEligibleForPaymentCompletion(
      await getOrderByIdRecord(payment.order_id),
    );
  }

  if (
    parsedInput.data.status !== "paid"
    && parsedInput.data.paid_at !== undefined
    && parsedInput.data.paid_at !== null
  ) {
    throw badRequestError("paid_at can only be set when status is paid");
  }

  const nextPaidAt =
    parsedInput.data.status === "paid"
      ? parsedInput.data.paid_at ?? new Date().toISOString()
      : payment.paid_at;

  const updatedPayment = await transitionPaymentStatusRecord(payment.id, {
    currentStatus: payment.status,
    nextStatus: parsedInput.data.status,
    transactionRef:
      parsedInput.data.transaction_ref ?? payment.transaction_ref ?? null,
    paidAt:
      parsedInput.data.status === "refunded" ? payment.paid_at ?? null : nextPaidAt,
  });

  if (!updatedPayment) {
    const latestPayment = await getPaymentByIdRecord(payment.id);

    if (!latestPayment) {
      throw notFoundError("Payment not found");
    }

    throw badRequestError("Payment status could not be updated");
  }

  return mapPayment(updatedPayment);
}
