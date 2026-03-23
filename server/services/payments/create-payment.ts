import type { Payment } from "../../../types";
import { createPaymentRecord } from "../../repositories/payments/create-payment";
import { getPaymentByOrderIdRecord } from "../../repositories/payments/get-payment-by-order-id";
import { getOrderByIdRecord } from "../../repositories/orders/get-order-by-id";
import { createPaymentSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { requireOrderEligibleForPayment } from "../orders/order-workflow-rules";
import { mapPayment } from "./map-payment";

export async function createPayment(input: unknown): Promise<Payment> {
  const parsedInput = createPaymentSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const order = requireOrderEligibleForPayment(
    await getOrderByIdRecord(parsedInput.data.order_id),
  );

  if (Number(parsedInput.data.amount) !== Number(order.total_amount)) {
    throw badRequestError("Payment amount must match order total");
  }

  if (parsedInput.data.status !== "pending") {
    throw badRequestError("Payment must start as pending");
  }

  if (parsedInput.data.paid_at) {
    throw badRequestError("paid_at cannot be set when creating a payment");
  }

  const existingPayment = await getPaymentByOrderIdRecord(order.id);

  if (existingPayment) {
    if (existingPayment.status === "paid") {
      throw badRequestError("Order already has a successful payment");
    }

    throw badRequestError("Payment already exists for this order");
  }

  const payment = await createPaymentRecord({
    ...parsedInput.data,
    amount: Number(parsedInput.data.amount),
    status: "pending",
    paid_at: null,
  });

  return mapPayment(payment);
}
