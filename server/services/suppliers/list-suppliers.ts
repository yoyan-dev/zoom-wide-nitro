import type { PaginatedResult, Supplier } from "../../../types";
import { listSupplierRecords } from "../../repositories/suppliers/list-suppliers";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { mapSupplier } from "./map-supplier";

export type ListSuppliersParams = {
  q?: string;
  page?: number;
  limit?: number;
};

export async function listSuppliers(
  params: ListSuppliersParams,
): Promise<PaginatedResult<Supplier[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listSupplierRecords({
    q: params.q,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data.map(mapSupplier),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
