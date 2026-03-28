import type { Driver } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DRIVER_SELECT } from "./driver-select";

export async function getDriverByIdRecord(id: string): Promise<Driver | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("drivers")
    .select(DRIVER_SELECT)
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Driver | null);
}
