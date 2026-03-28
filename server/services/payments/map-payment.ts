import type { Payment } from "../../types";

export function mapPayment(payment: Payment): Payment {
  return {
    ...payment,
    transaction_ref: payment.transaction_ref ?? null,
    paid_at: payment.paid_at ?? null,
  };
}
