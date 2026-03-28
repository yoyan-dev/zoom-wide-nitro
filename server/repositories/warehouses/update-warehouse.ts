import type { z } from "zod";
import type { Warehouse } from "../../types";
import { updateWarehouseSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;

export async function updateWarehouseRecord(
  id: string,
  input: UpdateWarehouseInput,
): Promise<Warehouse | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      name: input.name,
      address: input.address,
      manager_id: input.manager_id,
      capacity: input.capacity,
      status: input.status,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("warehouses")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Warehouse | null);
}
