import type { z } from "zod";
import type { Customer } from "../../types";
import { createCustomerSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export async function createCustomerRecord(
  input: CreateCustomerInput,
): Promise<Customer> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const payload = {
    user_id: input.user_id ?? null,
    company_name: input.company_name,
    contact_name: input.contact_name,
    phone: input.phone ?? null,
    email: input.email,
    image_url: input.image_url ?? null,
    billing_address: input.billing_address ?? null,
    shipping_address: input.shipping_address ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("customers")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);

  return (data ?? {}) as Customer;
}
