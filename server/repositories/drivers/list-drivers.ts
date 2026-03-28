import type { Driver } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DRIVER_SELECT } from "./driver-select";

export type ListDriverRecordsParams = {
  q?: string;
  from: number;
  to: number;
};

export async function listDriverRecords(
  params: ListDriverRecordsParams,
): Promise<RepositoryListResult<Driver>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("drivers")
    .select(DRIVER_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [
        `name.ilike.%${params.q}%`,
        `email.ilike.%${params.q}%`,
        `phone.ilike.%${params.q}%`,
        `license_number.ilike.%${params.q}%`,
        `vehicle_number.ilike.%${params.q}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Driver[],
    count,
  });
}
