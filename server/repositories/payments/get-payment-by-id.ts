import type { Payment } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PAYMENT_SELECT } from "./payment-select";

export async function getPaymentByIdRecord(
  id: string,
): Promise<Payment | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Payment | null);
}
