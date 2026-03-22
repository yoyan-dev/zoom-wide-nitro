import type { Product } from "../../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PRODUCT_RELATION_SELECT } from "../products/product-select";

export type ListStockViewRecordsParams = {
  q?: string;
  product_id?: string;
  from: number;
  to: number;
};

export async function listStockViewRecords(
  params: ListStockViewRecordsParams,
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

  if (params.product_id) {
    query = query.eq("id", params.product_id);
  }

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Product[],
    count,
  });
}
