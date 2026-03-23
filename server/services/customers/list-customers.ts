import type { Customer, PaginatedResult } from "../../../types";
import { listCustomerRecords } from "../../repositories/customers/list-customers";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { mapCustomer } from "./map-customer";

export type ListCustomersParams = {
  q?: string;
  page?: number;
  limit?: number;
};

export async function listCustomers(
  params: ListCustomersParams,
): Promise<PaginatedResult<Customer[]>> {
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listCustomerRecords({
    q: params.q,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data.map(mapCustomer),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
