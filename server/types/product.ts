import type { Category } from "./category";
import type { InventoryStockItem } from "./inventory";
import type { PaginationMeta, PaginationParams } from "./pagination";
import type { Supplier } from "./supplier";

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
  supplier_id?: string;
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
  handbook?: ProductHandbookDetails;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FetchProductParams extends PaginationParams {
  q?: string;
  category_id?: string;
}

export interface ProductSalesInsight {
  productId: string;
  totalQuantitySold: number;
  totalRevenue: number;
  orderItemCount: number;
  product?: Product;
}

export interface ProductCategoryCount {
  categoryId: string | null;
  categoryName: string;
  productCount: number;
}

export interface ProductInsights {
  lowStockProducts: InventoryStockItem[];
  recentProducts: Product[];
  topSellingProducts: ProductSalesInsight[];
  productsByCategory: ProductCategoryCount[];
}

export interface ProductPagination extends PaginationMeta {}
