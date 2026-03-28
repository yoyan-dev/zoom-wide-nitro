import type { Payment, PaymentStatus } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PAYMENT_SELECT } from "./payment-select";

type TransitionPaymentStatusInput = {
  currentStatus: PaymentStatus;
  nextStatus: PaymentStatus;
  transactionRef?: string | null;
  paidAt?: string | null;
};

export async function transitionPaymentStatusRecord(
  id: string,
  input: TransitionPaymentStatusInput,
): Promise<Payment | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      status: input.nextStatus,
      transaction_ref: input.transactionRef,
      paid_at: input.paidAt,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", id)
    .eq("status", input.currentStatus)
    .select(PAYMENT_SELECT)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Payment | null);
}
