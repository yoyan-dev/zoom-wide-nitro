import type { User } from "../../types";
import type { CustomerType } from "../../types";
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
  customer_type?: CustomerType | null;
  phone?: string | null;
  image_url?: string | null;
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
    customer_type: input.customer_type ?? null,
    phone: input.phone ?? null,
    image_url: input.image_url ?? null,
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
