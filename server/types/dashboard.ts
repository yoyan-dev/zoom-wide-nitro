import type { Delivery, DeliveryStatus } from "./delivery";
import type { InventoryLog } from "./inventory";
import type { OrderDetail, OrderStatus } from "./order";
import type { Payment, PaymentStatus } from "./payment";

export type StatusSummary<TStatus extends string> = Record<TStatus, number>;

export interface DashboardSummary {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  lowStockProductCount: number;
  totalPayments: number;
  ordersByStatus: StatusSummary<OrderStatus>;
  deliveriesByStatus: StatusSummary<DeliveryStatus>;
  paymentsByStatus: StatusSummary<PaymentStatus>;
}

export interface DashboardRecentActivity {
  recentOrders: OrderDetail[];
  recentDeliveries: Delivery[];
  recentInventoryMovements: InventoryLog[];
  recentPayments: Payment[];
}
