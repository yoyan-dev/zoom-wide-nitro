import type { PaymentReportSummary } from "../../../types";
import { getPaymentSummaryRecord } from "../../repositories/payments/get-payment-summary";
import {
  assertValidPaymentReportMethod,
  assertValidPaymentReportStatus,
} from "./payment-reporting";

export type GetPaymentSummaryParams = {
  q?: string;
  status?: string;
  method?: string;
  order_id?: string;
  from?: string;
  to?: string;
};

export async function getPaymentSummary(
  params: GetPaymentSummaryParams,
): Promise<PaymentReportSummary> {
  const status = assertValidPaymentReportStatus(params.status);
  const method = assertValidPaymentReportMethod(params.method);

  return getPaymentSummaryRecord({
    q: params.q,
    status,
    method,
    order_id: params.order_id,
    from: params.from,
    to: params.to,
  });
}
