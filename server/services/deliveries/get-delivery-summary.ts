import type { DeliveryReportSummary } from "../../types";
import { getDeliverySummaryRecord } from "../../repositories/deliveries/get-delivery-summary";
import { assertValidDeliveryReportStatus } from "./delivery-reporting";

export type GetDeliverySummaryParams = {
  q?: string;
  status?: string;
  order_id?: string;
  driver_id?: string;
  from?: string;
  to?: string;
};

export async function getDeliverySummary(
  params: GetDeliverySummaryParams,
): Promise<DeliveryReportSummary> {
  const status = assertValidDeliveryReportStatus(params.status);

  return getDeliverySummaryRecord({
    q: params.q,
    status,
    order_id: params.order_id,
    driver_id: params.driver_id,
    from: params.from,
    to: params.to,
  });
}
