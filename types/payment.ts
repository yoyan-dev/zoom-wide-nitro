import type { PaginationMeta, PaginationParams } from "./pagination";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "mobile_wallet";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface PaymentReportSummary {
  totalMatchingPayments: number;
  totalPaidAmount: number;
  pendingPaymentsCount: number;
  failedPaymentsCount: number;
  refundedPaymentsCount: number;
  countsByStatus: Record<PaymentStatus, number>;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchPaymentParams extends PaginationParams {
  q?: string;
  status?: PaymentStatus | "";
  method?: PaymentMethod | "";
  order_id?: string;
  from?: string;
  to?: string;
}

export interface PaymentPagination extends PaginationMeta {}
