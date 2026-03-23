import type { OrderReportSummary } from "../../../types";
import { getOrderSummaryRecord } from "../../repositories/orders/get-order-summary";
import { assertValidOrderReportStatus } from "./order-reporting";

export type GetOrderSummaryParams = {
  q?: string;
  status?: string;
  customer_id?: string;
  from?: string;
  to?: string;
};

export async function getOrderSummary(
  params: GetOrderSummaryParams,
): Promise<OrderReportSummary> {
  const status = assertValidOrderReportStatus(params.status);

  return getOrderSummaryRecord({
    q: params.q,
    status,
    customer_id: params.customer_id,
    from: params.from,
    to: params.to,
  });
}
