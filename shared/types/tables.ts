export type UserRole =
  | "admin"
  | "manager"
  | "staff"
  | "customer"
  | "warehouse_manager"
  | "finance"
  | "driver"
  | "supplier"
  | "auditor";
export type CartStatus = "active" | "checked_out" | "abandoned";
export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";
export type DeliveryStatus = "scheduled" | "in_transit" | "delivered" | "failed";
export type InventoryMovementType = "in" | "out" | "adjustment";
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "mobile_wallet";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  supplier_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  image_url: string | null;
  unit: string;
  price: number;
  stock_quantity: number;
  minimum_stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  customer_id: string;
  status: CartStatus;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_name: string | null;
  vehicle_number: string | null;
  status: DeliveryStatus;
  scheduled_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
