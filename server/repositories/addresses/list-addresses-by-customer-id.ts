import type { Address } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export type ListAddressRecordsParams = {
  customerId: string;
  q?: string;
  from: number;
  to: number;
};

export async function listAddressRecordsByCustomerId(
  params: ListAddressRecordsParams,
): Promise<RepositoryListResult<Address>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("customer_addresses")
    .select("*", { count: "exact" })
    .eq("customer_id", params.customerId)
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [
        `street.ilike.%${params.q}%`,
        `city.ilike.%${params.q}%`,
        `province.ilike.%${params.q}%`,
        `postal_code.ilike.%${params.q}%`,
        `country.ilike.%${params.q}%`,
        `address_line.ilike.%${params.q}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Address[],
    count,
  });
}
