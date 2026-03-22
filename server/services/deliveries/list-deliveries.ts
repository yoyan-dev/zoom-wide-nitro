import type { Delivery, PaginatedResult } from "../../../types";
import { listDeliveryRecords } from "../../repositories/deliveries/list-deliveries";
import { badRequestError } from "../../utils/errors";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { mapDelivery } from "./map-delivery";

const DELIVERY_STATUSES = new Set([
  "scheduled",
  "in_transit",
  "delivered",
  "failed",
  "cancelled",
]);

export type ListDeliveriesParams = {
  q?: string;
  status?: string;
  order_id?: string;
  driver_id?: string;
  page?: number;
  limit?: number;
};

export async function listDeliveries(
  params: ListDeliveriesParams,
): Promise<PaginatedResult<Delivery[]>> {
  if (params.status && !DELIVERY_STATUSES.has(params.status)) {
    throw badRequestError("status must be a valid delivery status");
  }

  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listDeliveryRecords({
    q: params.q,
    status: params.status,
    order_id: params.order_id,
    driver_id: params.driver_id,
    from: pagination.from,
    to: pagination.to,
  });

  return {
    data: result.data.map(mapDelivery),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
