import type { Order, PaginatedResult } from "../../types";
import { listOrderRecords } from "../../repositories/orders/list-orders";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { assertValidOrderReportStatus } from "./order-reporting";
import { mapOrder } from "./map-order";

export type ListOrdersParams = {
  q?: string;
  status?: string;
  customer_id?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export async function listOrders(
  params: ListOrdersParams,
): Promise<PaginatedResult<Order[]>> {
  const status = assertValidOrderReportStatus(params.status);

  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listOrderRecords({
    q: params.q,
    status,
    customer_id: params.customer_id,
    from: params.from,
    to: params.to,
    rangeFrom: pagination.from,
    rangeTo: pagination.to,
  });

  return {
    data: result.data.map(mapOrder),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
