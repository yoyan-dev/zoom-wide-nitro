export type UserRole =
  | "admin"
  | "customer"
  | "driver"
  | "supplier";

export type CustomerType = "contractor" | "regular";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  customer_type: CustomerType | null;
  phone: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
