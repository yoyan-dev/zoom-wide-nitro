import type { Driver } from "../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DRIVER_SELECT } from "./driver-select";

export type CreateDriverRecordInput = {
  user_id: string;
  name: string;
  phone?: string | null;
  email: string;
  image_url?: string | null;
  license_number?: string | null;
  vehicle_number?: string | null;
  is_active?: boolean;
};

export async function createDriverRecord(
  input: CreateDriverRecordInput,
): Promise<Driver> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    user_id: input.user_id,
    name: input.name,
    phone: input.phone ?? null,
    email: input.email,
    image_url: input.image_url ?? null,
    license_number: input.license_number ?? null,
    vehicle_number: input.vehicle_number ?? null,
    is_active: input.is_active ?? true,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("drivers")
    .insert(payload)
    .select(DRIVER_SELECT)
    .single();

  ensureRepositorySuccess(error);
  return (data ?? {}) as Driver;
}
