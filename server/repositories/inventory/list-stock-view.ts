import type { Product } from "../../types";
import type { RepositoryListResult } from "../../utils/supabase-repository";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import {
  applyStockReportFilters,
  type InventoryStockReportFilters,
} from "./apply-stock-report-filters";
import { PRODUCT_RELATION_SELECT } from "../products/product-select";

export type ListStockViewRecordsParams = InventoryStockReportFilters & {
  rangeFrom?: number;
  rangeTo?: number;
};

export async function listStockViewRecords(
  params: ListStockViewRecordsParams,
): Promise<RepositoryListResult<Product>> {
  const supabase = useRepositoryClient();

  let query = supabase
    .from("products")
    .select(PRODUCT_RELATION_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.rangeFrom !== undefined && params.rangeTo !== undefined) {
    query = query.range(params.rangeFrom, params.rangeTo);
  }

  query = applyStockReportFilters(query, params);

  const { data, error, count } = await query;

  ensureRepositorySuccess(error);
  return mapListResult({
    data: (data ?? []) as Product[],
    count,
  });
}
