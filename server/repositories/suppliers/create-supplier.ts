import type { z } from "zod";
import type { Supplier } from "../../types";
import { createSupplierSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export async function createSupplierRecord(
  input: CreateSupplierInput,
): Promise<Supplier> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    name: input.name,
    contact_name: input.contact_name ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("suppliers")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);

  return (data ?? {}) as Supplier;
}
