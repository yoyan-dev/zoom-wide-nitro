import type { z } from "zod";
import type { Delivery } from "../../../types";
import { createDeliverySchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DELIVERY_SELECT } from "./delivery-select";

type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;

export async function createDeliveryRecord(
  input: CreateDeliveryInput,
): Promise<Delivery> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    order_id: input.order_id,
    driver_id: input.driver_id ?? null,
    vehicle_number: input.vehicle_number ?? null,
    status: input.status,
    scheduled_at: input.scheduled_at ?? null,
    delivered_at: input.delivered_at ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("deliveries")
    .insert(payload)
    .select(DELIVERY_SELECT)
    .single();

  ensureRepositorySuccess(error);

  return (data ?? {}) as Delivery;
}
