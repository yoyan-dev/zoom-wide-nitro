import type { PaginationMeta, PaginationParams } from "./pagination";

export interface Address {
  id: string;
  customer_id: string;
  street: string;
  city: string;
  province: string;
  postal_code: string | null;
  country: string | null;
  address_line: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchAddressParams extends PaginationParams {
  q?: string;
}

export interface AddressPagination extends PaginationMeta {}
