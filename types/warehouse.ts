import type { PaginationMeta, PaginationParams } from "./pagination";

export type WarehouseStatus = "active" | "inactive" | "archived";

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  manager_id: string | null;
  capacity: number;
  status: WarehouseStatus;
  created_at: string;
  updated_at: string;
}

export interface FetchWarehouseParams extends PaginationParams {
  q?: string;
  status?: WarehouseStatus | "";
}

export interface WarehousePagination extends PaginationMeta {}
