import type { DashboardSummary } from "../../../types";
import { getDashboardBaseCountsRecord } from "../../repositories/dashboard/get-dashboard-summary";
import { getDeliverySummaryRecord } from "../../repositories/deliveries/get-delivery-summary";
import { getStockSummaryRecord } from "../../repositories/inventory/get-stock-summary";
import { getOrderSummaryRecord } from "../../repositories/orders/get-order-summary";
import { getPaymentSummaryRecord } from "../../repositories/payments/get-payment-summary";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [
    baseCounts,
    stockSummary,
    orderSummary,
    deliverySummary,
    paymentSummary,
  ] = await Promise.all([
    getDashboardBaseCountsRecord(),
    getStockSummaryRecord({}),
    getOrderSummaryRecord({}),
    getDeliverySummaryRecord({}),
    getPaymentSummaryRecord({}),
  ]);

  return {
    totalProducts: stockSummary.totalProducts,
    totalCategories: baseCounts.totalCategories,
    totalCustomers: baseCounts.totalCustomers,
    totalOrders: orderSummary.totalMatchingOrders,
    lowStockProductCount: stockSummary.lowStockProducts,
    totalPayments: paymentSummary.totalMatchingPayments,
    ordersByStatus: orderSummary.countsByStatus,
    deliveriesByStatus: deliverySummary.countsByStatus,
    paymentsByStatus: paymentSummary.countsByStatus,
  };
}
