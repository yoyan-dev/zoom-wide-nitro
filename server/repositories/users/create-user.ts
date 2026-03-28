import type { User } from "../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { USER_SELECT } from "./user-select";

type CreateUserRecordInput = {
  id: string;
  email: string;
  full_name: string;
  role: User["role"];
  phone?: string | null;
};

export async function createUserRecord(
  input: CreateUserRecordInput,
): Promise<User> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    id: input.id,
    email: input.email,
    full_name: input.full_name,
    role: input.role,
    phone: input.phone ?? null,
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select(USER_SELECT)
    .single();

  ensureRepositorySuccess(error);

  return (data ?? {}) as User;
}
