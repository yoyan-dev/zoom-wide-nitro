import type { User } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { USER_SELECT } from "./user-select";

export type UpdateUserRecordInput = {
  email?: string;
  full_name?: string;
  role?: User["role"];
  phone?: string | null;
  is_active?: boolean;
};

export async function updateUserRecord(
  id: string,
  input: UpdateUserRecordInput,
): Promise<User | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      phone: input.phone,
      is_active: input.is_active,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select(USER_SELECT)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as User | null);
}
