import type { PaginationMeta, PaginationParams } from "./pagination";
import type { User } from "./user";

export interface Supplier {
  id: string;
  user_id: string | null;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  user?: User | null;
  is_active?: boolean;
}

export interface FetchSupplierParams extends PaginationParams {
  q?: string;
}

export interface SupplierPagination extends PaginationMeta {}
