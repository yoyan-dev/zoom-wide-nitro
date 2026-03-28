import type { Customer } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export type ListCustomerRecordsParams = {
  q?: string;
  from: number;
  to: number;
};

export async function listCustomerRecords(
  params: ListCustomerRecordsParams,
): Promise<RepositoryListResult<Customer>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [
        `company_name.ilike.%${params.q}%`,
        `contact_name.ilike.%${params.q}%`,
        `email.ilike.%${params.q}%`,
        `phone.ilike.%${params.q}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Customer[],
    count,
  });
}
