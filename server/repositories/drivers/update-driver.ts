import type { Driver } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DRIVER_SELECT } from "./driver-select";

export type UpdateDriverRecordInput = {
  name?: string;
  phone?: string | null;
  email?: string;
  image_url?: string | null;
  license_number?: string | null;
  vehicle_number?: string | null;
  is_active?: boolean;
};

export async function updateDriverRecord(
  id: string,
  input: UpdateDriverRecordInput,
): Promise<Driver | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      name: input.name,
      phone: input.phone,
      email: input.email,
      image_url: input.image_url,
      license_number: input.license_number,
      vehicle_number: input.vehicle_number,
      is_active: input.is_active,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("drivers")
    .update(updates)
    .eq("id", id)
    .select(DRIVER_SELECT)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Driver | null);
}
