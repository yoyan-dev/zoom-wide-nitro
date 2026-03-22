import type { z } from "zod";
import type { Order } from "../../../types";
import { createOrderSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { ORDER_DETAIL_SELECT } from "./order-select";

type CreateOrderInput = z.infer<typeof createOrderSchema>;

export async function createOrderRecord(input: CreateOrderInput): Promise<Order> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    customer_id: input.customer_id,
    status: input.status,
    total_amount: input.total_amount,
    notes: input.notes ?? null,
    approved_by: input.approved_by ?? null,
    rejection_reason: input.rejection_reason ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select(ORDER_DETAIL_SELECT)
    .single();

  ensureRepositorySuccess(error);

  return (data ?? {}) as Order;
}
