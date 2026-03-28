import type { z } from "zod";
import type { Customer } from "../../types";
import { updateCustomerSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export async function updateCustomerRecord(
  id: string,
  input: UpdateCustomerInput,
): Promise<Customer | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      user_id: input.user_id,
      company_name: input.company_name,
      contact_name: input.contact_name,
      phone: input.phone,
      email: input.email,
      image_url: input.image_url,
      billing_address: input.billing_address,
      shipping_address: input.shipping_address,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Customer | null);
}
