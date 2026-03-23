import type { PaginationMeta, PaginationParams } from "./pagination";

export interface Supplier {
  id?: string;
  name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FetchSupplierParams extends PaginationParams {
  q?: string;
}

export interface SupplierPagination extends PaginationMeta {}
