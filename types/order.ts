import type { Customer } from "./customer";
import type { PaginationMeta, PaginationParams } from "./pagination";
import type { Product } from "./product";

export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  customer?: Customer;
  items: OrderItem[];
  total_items: number;
}

export interface FetchOrderParams extends PaginationParams {
  q?: string;
  status?: OrderStatus | "";
  customer_id?: string;
}

export interface OrderPagination extends PaginationMeta {}
