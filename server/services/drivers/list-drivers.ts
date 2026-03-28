import type { Driver, PaginatedResult } from "../../types";
import { listDriverRecords } from "../../repositories/drivers/list-drivers";
import { getPagination, getPaginationMeta } from "../../utils/pagination";

type ListDriversParams = {
  q?: string;
  page?: number;
  limit?: number;
};

export async function listDrivers(
  params: ListDriversParams,
): Promise<PaginatedResult<Driver[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listDriverRecords({
    q: params.q,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data,
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
