import type { Category, PaginatedResult } from "../../types";
import { listCategoryRecords } from "../../repositories/categories/list-categories";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { mapCategory } from "./map-category";

export type ListCategoriesParams = {
  q?: string;
  page?: number;
  limit?: number;
};

export async function listCategories(
  params: ListCategoriesParams,
): Promise<PaginatedResult<Category[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listCategoryRecords({
    q: params.q,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data.map(mapCategory),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
