import type { Supplier } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export type ListSupplierRecordsParams = {
  q?: string;
  from: number;
  to: number;
};

export async function listSupplierRecords(
  params: ListSupplierRecordsParams,
): Promise<RepositoryListResult<Supplier>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("suppliers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [
        `id.ilike.%${params.q}%`,
        `name.ilike.%${params.q}%`,
        `contact_name.ilike.%${params.q}%`,
        `email.ilike.%${params.q}%`,
        `phone.ilike.%${params.q}%`,
        `address.ilike.%${params.q}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Supplier[],
    count,
  });
}
