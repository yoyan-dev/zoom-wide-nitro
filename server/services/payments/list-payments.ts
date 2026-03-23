import type { PaginatedResult, Payment } from "../../../types";
import { listPaymentRecords } from "../../repositories/payments/list-payments";
import { getPagination, getPaginationMeta } from "../../utils/pagination";
import {
  assertValidPaymentReportMethod,
  assertValidPaymentReportStatus,
} from "./payment-reporting";
import { mapPayment } from "./map-payment";

export type ListPaymentsParams = {
  q?: string;
  status?: string;
  method?: string;
  order_id?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export async function listPayments(
  params: ListPaymentsParams,
): Promise<PaginatedResult<Payment[]>> {
  const status = assertValidPaymentReportStatus(params.status);
  const method = assertValidPaymentReportMethod(params.method);
  const pagination = getPagination({
    page: params.page,
    limit: params.limit,
  });

  const result = await listPaymentRecords({
    q: params.q,
    status,
    method,
    order_id: params.order_id,
    from: params.from,
    to: params.to,
    rangeFrom: pagination.from,
    rangeTo: pagination.to,
  });

  return {
    data: result.data.map(mapPayment),
    meta: getPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
    }),
  };
}
