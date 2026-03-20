import type { Category } from "./category";
import type { PaginationMeta, PaginationParams } from "./pagination";
import type { Supplier } from "./supplier";
import type { Warehouse } from "./warehouse";

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductHandbookDetails {
  summary?: string;
  features?: string[];
  applications?: string[];
  specifications?: ProductSpecification[];
}

export interface Product {
  id?: string;
  category_id?: string;
  supplier_id?: string | null;
  warehouse_id?: string | null;
  sku?: string;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  unit?: string;
  price?: number;
  stock_quantity?: number;
  minimum_stock_quantity?: number;
  category?: Category;
  supplier?: Supplier;
  warehouse?: Warehouse;
  handbook?: ProductHandbookDetails;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FetchProductParams extends PaginationParams {
  q?: string;
  category_id?: string;
  supplier_id?: string;
}

export interface ProductPaginaton extends PaginationMeta {}
