import type {
  InventoryStockItem,
  Product,
  ProductCategoryCount,
  ProductInsights,
  ProductSalesInsight,
} from "../../types";
import {
  getLowStockProductRecords,
  getProductCategoryCountRecords,
  getRecentProductRecords,
  getTopSellingProductRecords,
} from "../../repositories/products/get-product-insights";
import { normalizeReportLimit } from "../../utils/reporting";
import { mapStockViewItem } from "../inventory/map-stock-view-item";
import { mapProduct } from "./map-product";

type GetProductInsightsParams = {
  limit?: number;
};

function buildLowStockProducts(
  records: Product[],
  limit: number,
): InventoryStockItem[] {
  return records
    .map(mapStockViewItem)
    .filter((item) => item.is_low_stock)
    .sort((left, right) => {
      const leftGap = left.stock_quantity - left.minimum_stock_quantity;
      const rightGap = right.stock_quantity - right.minimum_stock_quantity;
      return leftGap - rightGap;
    })
    .slice(0, limit);
}

function buildTopSellingProducts(
  records: Awaited<ReturnType<typeof getTopSellingProductRecords>>,
  limit: number,
): ProductSalesInsight[] {
  const aggregated = new Map<string, ProductSalesInsight>();

  for (const record of records) {
    if (!record.product_id) {
      continue;
    }

    const current = aggregated.get(record.product_id);

    if (current) {
      current.totalQuantitySold += Number(record.quantity ?? 0);
      current.totalRevenue += Number(record.line_total ?? 0);
      current.orderItemCount += 1;
      continue;
    }

    aggregated.set(record.product_id, {
      productId: record.product_id,
      totalQuantitySold: Number(record.quantity ?? 0),
      totalRevenue: Number(record.line_total ?? 0),
      orderItemCount: 1,
      product: record.product ? mapProduct(record.product) : undefined,
    });
  }

  return [...aggregated.values()]
    .sort((left, right) => {
      if (right.totalQuantitySold !== left.totalQuantitySold) {
        return right.totalQuantitySold - left.totalQuantitySold;
      }

      return right.totalRevenue - left.totalRevenue;
    })
    .slice(0, limit);
}

function buildProductsByCategory(records: Product[]): ProductCategoryCount[] {
  const counts = new Map<string, ProductCategoryCount>();

  for (const record of records) {
    const categoryId = record.category?.id ?? "uncategorized";
    const current = counts.get(categoryId);

    if (current) {
      current.productCount += 1;
      continue;
    }

    counts.set(categoryId, {
      categoryId: record.category?.id ?? null,
      categoryName: record.category?.name ?? "Uncategorized",
      productCount: 1,
    });
  }

  return [...counts.values()].sort(
    (left, right) => right.productCount - left.productCount,
  );
}

export async function getProductInsights(
  params: GetProductInsightsParams = {},
): Promise<ProductInsights> {
  const limit = normalizeReportLimit(params.limit);
  const [lowStockRecords, recentRecords, topSellingRecords, categoryRecords] =
    await Promise.all([
      getLowStockProductRecords(),
      getRecentProductRecords(limit),
      getTopSellingProductRecords(),
      getProductCategoryCountRecords(),
    ]);

  return {
    lowStockProducts: buildLowStockProducts(lowStockRecords, limit),
    recentProducts: recentRecords.map(mapProduct),
    topSellingProducts: buildTopSellingProducts(topSellingRecords, limit),
    productsByCategory: buildProductsByCategory(
      categoryRecords.map(mapProduct),
    ),
  };
}
