import type { z } from "zod";
import type { OrderItem } from "../../../types";
import { createOrderItemSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;

export async function createOrderItemsRecord(
  items: CreateOrderItemInput[],
): Promise<OrderItem[]> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();
  const payload = items.map((item) => ({
    order_id: item.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total ?? item.quantity * item.unit_price,
    created_at: now,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from("order_items")
    .insert(payload)
    .select("*");

  ensureRepositorySuccess(error);

  return (data ?? []) as OrderItem[];
}
