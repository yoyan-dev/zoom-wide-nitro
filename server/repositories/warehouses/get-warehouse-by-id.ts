import type { Warehouse } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function getWarehouseByIdRecord(
  id: string,
): Promise<Warehouse | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Warehouse | null);
}
