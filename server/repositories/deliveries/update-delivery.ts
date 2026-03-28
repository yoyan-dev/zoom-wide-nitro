import type { z } from "zod";
import type { Delivery } from "../../types";
import { updateDeliverySchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DELIVERY_SELECT } from "./delivery-select";

type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;

export async function updateDeliveryRecord(
  id: string,
  input: UpdateDeliveryInput,
): Promise<Delivery | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      order_id: input.order_id,
      driver_id: input.driver_id,
      vehicle_number: input.vehicle_number,
      status: input.status,
      scheduled_at: input.scheduled_at,
      delivered_at: input.delivered_at,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("id", id)
    .select(DELIVERY_SELECT)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Delivery | null);
}
