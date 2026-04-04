import type { z } from "zod";
import type { Address } from "../../types";
import { createAddressSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateAddressInput = z.infer<typeof createAddressSchema>;

export async function createAddressRecord(
  input: CreateAddressInput,
): Promise<Address> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    customer_id: input.customer_id,
    street: input.street,
    city: input.city,
    province: input.province,
    postal_code: input.postal_code ?? null,
    country: input.country ?? null,
    address_line: input.address_line ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("customer_addresses")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);

  return (data ?? {}) as Address;
}
