import type { z } from "zod";
import type { Address } from "../../types";
import { updateAddressSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export async function updateAddressRecord(
  customerId: string,
  addressId: string,
  input: UpdateAddressInput,
): Promise<Address | null> {
  const supabase = useRepositoryClient();

  const { data, error } = await supabase
    .from("customer_addresses")
    .update({
      street: input.street,
      city: input.city,
      province: input.province,
      postal_code: input.postal_code,
      country: input.country,
      address_line: input.address_line,
      updated_at: new Date().toISOString(),
    })
    .eq("customer_id", customerId)
    .eq("id", addressId)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Address | null);
}
