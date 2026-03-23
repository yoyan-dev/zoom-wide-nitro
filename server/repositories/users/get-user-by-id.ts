import type { User } from "../../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

const USER_SELECT =
  "id, email, full_name, role, phone, is_active, created_at, updated_at";

export async function getUserByIdRecord(id: string): Promise<User | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as User | null);
}
