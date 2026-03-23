import type { Product } from "./product";
import type { PaginationMeta, PaginationParams } from "./pagination";

export type InventoryMovementType = "in" | "out" | "adjustment";
export type InventoryStockStatus = "low_stock" | "out_of_stock";

export interface InventoryLog {
  id: string;
  product_id: string;
  movement_type: InventoryMovementType;
  quantity_change: number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
  product?: Product;
}

export interface InventoryStockItem {
  product_id: string;
  stock_quantity: number;
  minimum_stock_quantity: number;
  is_low_stock: boolean;
  product: Product;
}

export interface InventoryMovementResult {
  log: InventoryLog;
  stock: InventoryStockItem;
}

export interface InventoryStockSummary {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockUnits: number;
}

export interface InventoryMovementSummary {
  totalMatchingMovements: number;
  countsByType: Record<InventoryMovementType, number>;
  totalInQuantity: number;
  totalOutQuantity: number;
  totalAdjustmentQuantity: number;
}

export interface FetchInventoryParams extends PaginationParams {
  q?: string;
  movement_type?: InventoryMovementType | "";
  product_id?: string;
  stock_status?: InventoryStockStatus | "";
  from?: string;
  to?: string;
}

export interface InventoryPagination extends PaginationMeta {}
