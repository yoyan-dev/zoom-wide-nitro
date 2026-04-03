import type { Address, PaginatedResult } from "../../types";
import { listAddressRecordsByCustomerId } from "../../repositories/addresses/list-addresses-by-customer-id";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { string } from "../../utils/validator";
import { mapAddress } from "./map-address";

export type ListCustomerAddressesParams = {
  customerId: unknown;
  q?: string;
  page?: number;
  limit?: number;
};

export async function listCustomerAddresses(
  params: ListCustomerAddressesParams,
): Promise<PaginatedResult<Address[]>> {
  const customerId = string(params.customerId, "Customer id");
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listAddressRecordsByCustomerId({
    customerId,
    q: params.q,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data.map(mapAddress),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
