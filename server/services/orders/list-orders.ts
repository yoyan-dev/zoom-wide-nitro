import type { Order, PaginatedResult } from "../../../types";
import { listOrderRecords } from "../../repositories/orders/list-orders";
import { badRequestError } from "../../utils/errors";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { mapOrder } from "./map-order";

const ORDER_STATUSES = new Set([
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
]);

export type ListOrdersParams = {
  q?: string;
  status?: string;
  customer_id?: string;
  page?: number;
  limit?: number;
};

export async function listOrders(
  params: ListOrdersParams,
): Promise<PaginatedResult<Order[]>> {
  if (params.status && !ORDER_STATUSES.has(params.status)) {
    throw badRequestError("status must be a valid order status");
  }

  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listOrderRecords({
    q: params.q,
    status: params.status,
    customer_id: params.customer_id,
    from: pagination.from,
    to: pagination.to,
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
