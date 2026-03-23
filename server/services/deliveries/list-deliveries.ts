import type { Delivery, PaginatedResult } from "../../../types";
import { listDeliveryRecords } from "../../repositories/deliveries/list-deliveries";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import { assertValidDeliveryReportStatus } from "./delivery-reporting";
import { mapDelivery } from "./map-delivery";

export type ListDeliveriesParams = {
  q?: string;
  status?: string;
  order_id?: string;
  driver_id?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export async function listDeliveries(
  params: ListDeliveriesParams,
): Promise<PaginatedResult<Delivery[]>> {
  const status = assertValidDeliveryReportStatus(params.status);

  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listDeliveryRecords({
    q: params.q,
    status,
    order_id: params.order_id,
    driver_id: params.driver_id,
    from: params.from,
    to: params.to,
    rangeFrom: pagination.from,
    rangeTo: pagination.to,
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
