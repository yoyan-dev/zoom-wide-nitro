import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function deleteAddressRecord(
  customerId: string,
  addressId: string,
): Promise<boolean> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("customer_id", customerId)
    .eq("id", addressId)
    .select("id")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return !!data;
}
