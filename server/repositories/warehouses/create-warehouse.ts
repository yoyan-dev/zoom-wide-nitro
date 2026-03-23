import type { z } from "zod";
import type { Warehouse } from "../../../types";
import { createWarehouseSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;

export async function createWarehouseRecord(
  input: CreateWarehouseInput,
): Promise<Warehouse> {
  const supabase = useRepositoryClient();

  const payload = {
    name: input.name,
    address: input.address,
    manager_id: input.manager_id ?? null,
    capacity: input.capacity,
    status: input.status,
  };

  const { data, error } = await supabase
    .from("warehouses")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);

  return data as Warehouse;
}
