import type { PaginatedResult, Product } from "../../types";
import { listProductRecords } from "../../repositories/products/list-products";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { mapProduct } from "./map-product";

export type ListProductsParams = {
  q?: string;
  category_id?: string;
  supplier_id?: string;
  page?: number;
  limit?: number;
};

export async function listProducts(
  params: ListProductsParams,
): Promise<PaginatedResult<Product[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listProductRecords({
    q: params.q,
    category_id: params.category_id,
    supplier_id: params.supplier_id,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data.map(mapProduct),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
