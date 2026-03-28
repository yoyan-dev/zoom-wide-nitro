import type { Warehouse } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export type ListWarehouseRecordsParams = {
  q?: string;
  status?: string;
  from: number;
  to: number;
};

export async function listWarehouseRecords(
  params: ListWarehouseRecordsParams,
): Promise<RepositoryListResult<Warehouse>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("warehouses")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [
        `id.ilike.%${params.q}%`,
        `name.ilike.%${params.q}%`,
        `address.ilike.%${params.q}%`,
      ].join(","),
    );
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Warehouse[],
    count,
  });
}
