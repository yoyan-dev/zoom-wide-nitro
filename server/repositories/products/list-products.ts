import type { Product } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PRODUCT_RELATION_SELECT } from "./product-select";

export type ListProductRecordsParams = {
  q?: string;
  category_id?: string;
  supplier_id?: string;
  from: number;
  to: number;
};

export async function listProductRecords(
  params: ListProductRecordsParams,
): Promise<RepositoryListResult<Product>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_RELATION_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.from, params.to);

  if (params.q) {
    query = query.or(
      [
        `sku.ilike.%${params.q}%`,
        `name.ilike.%${params.q}%`,
        `description.ilike.%${params.q}%`,
      ].join(","),
    );
  }

  if (params.category_id) {
    query = query.eq("category_id", params.category_id);
  }

  if (params.supplier_id) {
    query = query.eq("supplier_id", params.supplier_id);
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Product[],
    count,
  });
}
