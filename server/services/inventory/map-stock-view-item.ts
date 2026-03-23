import type { InventoryStockItem, Product } from "../../../types";
import { mapProduct } from "../products/map-product";

export function mapStockViewItem(record: Product): InventoryStockItem {
  const product = mapProduct(record);
  const stockQuantity = product.stock_quantity ?? 0;
  const minimumStockQuantity = product.minimum_stock_quantity ?? 0;

  return {
    product_id: product.id ?? "",
    stock_quantity: stockQuantity,
    minimum_stock_quantity: minimumStockQuantity,
    is_low_stock: stockQuantity <= minimumStockQuantity,
    product,
  };
}
