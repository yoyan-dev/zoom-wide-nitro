import type { Product } from "./product";

export type CartStatus = "active" | "checked_out" | "abandoned";

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
  line_total?: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface CartDetail extends Cart {
  items: CartItem[];
  total_items: number;
  total_amount: number;
}
