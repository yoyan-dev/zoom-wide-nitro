import type { Order, OrderStatus } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { ORDER_DETAIL_SELECT } from "./order-select";

type TransitionOrderStatusInput = {
  currentStatus: OrderStatus;
  nextStatus: OrderStatus;
  approvedBy?: string | null;
  rejectionReason?: string | null;
};

export async function transitionOrderStatusRecord(
  id: string,
  input: TransitionOrderStatusInput,
): Promise<Order | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      status: input.nextStatus,
      approved_by: input.approvedBy,
      rejection_reason: input.rejectionReason,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .eq("status", input.currentStatus)
    .select(ORDER_DETAIL_SELECT)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Order | null);
}
