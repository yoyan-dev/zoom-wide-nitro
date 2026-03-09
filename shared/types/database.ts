import type {
  Cart,
  CartItem,
  Category,
  Customer,
  Delivery,
  DeliveryStatus,
  InventoryLog,
  InventoryMovementType,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Product,
  Supplier,
  User,
  UserRole,
} from "./tables";

export interface UserInsert {
  id?: string;
  email: string;
  full_name: string;
  role?: UserRole;
  phone?: string | null;
  is_active?: boolean;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  role?: UserRole;
  phone?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

export interface CustomerInsert {
  id?: string;
  user_id?: string | null;
  company_name: string;
  contact_name: string;
  phone?: string | null;
  email: string;
  billing_address?: string | null;
  shipping_address?: string | null;
}

export interface CustomerUpdate {
  user_id?: string | null;
  company_name?: string;
  contact_name?: string;
  phone?: string | null;
  email?: string;
  billing_address?: string | null;
  shipping_address?: string | null;
  updated_at?: string;
}

export interface CategoryInsert {
  id?: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
  image_url?: string | null;
  updated_at?: string;
}

export interface SupplierInsert {
  id?: string;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface SupplierUpdate {
  name?: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  updated_at?: string;
}

export interface ProductInsert {
  id?: string;
  category_id: string;
  supplier_id?: string | null;
  sku: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  unit?: string;
  price: number;
  stock_quantity?: number;
  minimum_stock_quantity?: number;
  is_active?: boolean;
}

export interface ProductUpdate {
  category_id?: string;
  supplier_id?: string | null;
  sku?: string;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  unit?: string;
  price?: number;
  stock_quantity?: number;
  minimum_stock_quantity?: number;
  is_active?: boolean;
  updated_at?: string;
}

export interface CartInsert {
  id?: string;
  customer_id: string;
  status?: "active" | "checked_out" | "abandoned";
}

export interface CartUpdate {
  customer_id?: string;
  status?: "active" | "checked_out" | "abandoned";
  updated_at?: string;
}

export interface CartItemInsert {
  id?: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CartItemUpdate {
  quantity?: number;
  unit_price?: number;
  updated_at?: string;
}

export interface OrderInsert {
  id?: string;
  customer_id: string;
  status?: OrderStatus;
  total_amount: number;
  notes?: string | null;
  approved_by?: string | null;
  rejection_reason?: string | null;
}

export interface OrderUpdate {
  status?: OrderStatus;
  total_amount?: number;
  notes?: string | null;
  approved_by?: string | null;
  rejection_reason?: string | null;
  updated_at?: string;
}

export interface OrderItemInsert {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderItemUpdate {
  quantity?: number;
  unit_price?: number;
  line_total?: number;
  updated_at?: string;
}

export interface DeliveryInsert {
  id?: string;
  order_id: string;
  driver_name?: string | null;
  vehicle_number?: string | null;
  status?: DeliveryStatus;
  scheduled_at?: string | null;
  delivered_at?: string | null;
}

export interface DeliveryUpdate {
  driver_name?: string | null;
  vehicle_number?: string | null;
  status?: DeliveryStatus;
  scheduled_at?: string | null;
  delivered_at?: string | null;
  updated_at?: string;
}

export interface InventoryLogInsert {
  id?: string;
  product_id: string;
  movement_type: InventoryMovementType;
  quantity_change: number;
  reference_type?: string | null;
  reference_id?: string | null;
  note?: string | null;
  created_by?: string | null;
}

export interface PaymentInsert {
  id?: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  transaction_ref?: string | null;
  paid_at?: string | null;
}

export interface PaymentUpdate {
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  transaction_ref?: string | null;
  paid_at?: string | null;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [];
      };
      suppliers: {
        Row: Supplier;
        Insert: SupplierInsert;
        Update: SupplierUpdate;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [];
      };
      carts: {
        Row: Cart;
        Insert: CartInsert;
        Update: CartUpdate;
        Relationships: [];
      };
      cart_items: {
        Row: CartItem;
        Insert: CartItemInsert;
        Update: CartItemUpdate;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
        Relationships: [];
      };
      deliveries: {
        Row: Delivery;
        Insert: DeliveryInsert;
        Update: DeliveryUpdate;
        Relationships: [];
      };
      inventory_logs: {
        Row: InventoryLog;
        Insert: InventoryLogInsert;
        Update: never;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      cart_status: "active" | "checked_out" | "abandoned";
      order_status: OrderStatus;
      delivery_status: DeliveryStatus;
      inventory_movement_type: InventoryMovementType;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database["public"]["Tables"];
