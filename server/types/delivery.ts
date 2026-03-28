import type { Order } from "./order";
import type { PaginationMeta, PaginationParams } from "./pagination";
import type { Driver } from "./driver";

export type DeliveryStatus =
  | "scheduled"
  | "in_transit"
  | "delivered"
  | "failed"
  | "cancelled";

export interface DeliveryReportSummary {
  totalMatchingDeliveries: number;
  failedDeliveriesCount: number;
  countsByStatus: Record<DeliveryStatus, number>;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  vehicle_number: string | null;
  status: DeliveryStatus;
  scheduled_at: string | null;
  delivered_at: string | null;
  order?: Order;
  driver?: Driver;
  created_at: string;
  updated_at: string;
}

export interface FetchDeliveryParams extends PaginationParams {
  q?: string;
  status?: DeliveryStatus | "";
  order_id?: string;
  driver_id?: string;
  from?: string;
  to?: string;
}

export interface DeliveryPagination extends PaginationMeta {}
