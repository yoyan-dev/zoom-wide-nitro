import type { Product } from "./product";
import type { PaginationMeta, PaginationParams } from "./pagination";

export type InventoryMovementType = "in" | "out" | "adjustment";

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

export interface FetchInventoryParams extends PaginationParams {
  q?: string;
  movement_type?: InventoryMovementType | "";
  product_id?: string;
}

export interface InventoryPagination extends PaginationMeta {}
