import type { DashboardRecentActivity, Delivery, InventoryLog, Order, Payment } from "../../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { DELIVERY_SELECT } from "../deliveries/delivery-select";
import { INVENTORY_LOG_SELECT } from "../inventory/inventory-log-select";
import { ORDER_DETAIL_SELECT } from "../orders/order-select";
import { PAYMENT_SELECT } from "../payments/payment-select";

export async function getRecentOrderRecords(limit: number): Promise<Order[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  ensureRepositorySuccess(error);
  return (data ?? []) as Order[];
}

export async function getRecentDeliveryRecords(limit: number): Promise<Delivery[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("deliveries")
    .select(DELIVERY_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  ensureRepositorySuccess(error);
  return (data ?? []) as Delivery[];
}

export async function getRecentInventoryMovementRecords(
  limit: number,
): Promise<InventoryLog[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("inventory_logs")
    .select(INVENTORY_LOG_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  ensureRepositorySuccess(error);
  return (data ?? []) as InventoryLog[];
}

export async function getRecentPaymentRecords(limit: number): Promise<Payment[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  ensureRepositorySuccess(error);
  return (data ?? []) as Payment[];
}

export async function getDashboardRecentActivityRecord(
  limit: number,
): Promise<DashboardRecentActivity> {
  const [
    recentOrders,
    recentDeliveries,
    recentInventoryMovements,
    recentPayments,
  ] = await Promise.all([
    getRecentOrderRecords(limit),
    getRecentDeliveryRecords(limit),
    getRecentInventoryMovementRecords(limit),
    getRecentPaymentRecords(limit),
  ]);

  return {
    recentOrders,
    recentDeliveries,
    recentInventoryMovements,
    recentPayments,
  };
}
