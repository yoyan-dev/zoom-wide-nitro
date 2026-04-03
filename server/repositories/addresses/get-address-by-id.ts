import type { Address } from "../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function getAddressByIdRecord(
  customerId: string,
  addressId: string,
): Promise<Address | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .eq("id", addressId)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Address | null);
}
