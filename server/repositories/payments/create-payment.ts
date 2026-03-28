import type { z } from "zod";
import type { Payment } from "../../types";
import { createPaymentSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PAYMENT_SELECT } from "./payment-select";

type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export async function createPaymentRecord(
  input: CreatePaymentInput,
): Promise<Payment> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    order_id: input.order_id,
    amount: input.amount,
    method: input.method,
    status: input.status,
    transaction_ref: input.transaction_ref ?? null,
    paid_at: input.paid_at ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select(PAYMENT_SELECT)
    .single();

  ensureRepositorySuccess(error);

  return (data ?? {}) as Payment;
}
