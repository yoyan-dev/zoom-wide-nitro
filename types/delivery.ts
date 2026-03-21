import type { PaginationMeta, PaginationParams } from "./pagination";

export type DeliveryStatus =
  | "scheduled"
  | "in_transit"
  | "delivered"
  | "failed"
  | "cancelled";

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  vehicle_number: string | null;
  status: DeliveryStatus;
  scheduled_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchDeliveryParams extends PaginationParams {
  q?: string;
  status?: DeliveryStatus | "";
  order_id?: string;
  driver_id?: string;
}

export interface DeliveryPagination extends PaginationMeta {}
