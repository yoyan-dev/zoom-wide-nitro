import type { PaginationMeta, PaginationParams } from "./pagination";

export interface Customer {
  id: string;
  user_id: string | null;
  company_name: string;
  contact_name: string;
  phone: string | null;
  email: string;
  billing_address: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchCustomerParams extends PaginationParams {
  q?: string;
}

export interface CustomerPagination extends PaginationMeta {}
