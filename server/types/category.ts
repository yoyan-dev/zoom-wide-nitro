import type { PaginationMeta, PaginationParams } from "./pagination";

export interface CategorySpecHighlight {
  label: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  overview?: string;
  typical_uses?: string[];
  buying_considerations?: string[];
  featured_specs?: CategorySpecHighlight[];
  created_at: string;
  updated_at: string;
}

export interface FetchCategoryParams extends PaginationParams {
  q?: string;
}

export interface CategoryPagination extends PaginationMeta {}
