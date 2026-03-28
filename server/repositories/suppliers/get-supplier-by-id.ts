import type { Supplier } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function getSupplierByIdRecord(
  id: string,
): Promise<Supplier | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Supplier | null);
}
