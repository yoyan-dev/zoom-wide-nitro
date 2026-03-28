import type { User } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { USER_SELECT } from "./user-select";

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
