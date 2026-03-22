import type { Category } from "../../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export type ListCategoryRecordsParams = {
  q?: string;
  from: number;
  to: number;
};

export async function listCategoryRecords(
  params: ListCategoryRecordsParams,
): Promise<RepositoryListResult<Category>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("categories")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [`name.ilike.%${params.q}%`, `description.ilike.%${params.q}%`].join(","),
    );
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Category[],
    count,
  });
}
