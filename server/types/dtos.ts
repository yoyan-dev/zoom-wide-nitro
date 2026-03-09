import type {
  DeliveryStatus,
  InventoryMovementType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../shared/types";

export interface CreateProductPayload {
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

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  image_url?: string | null;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
  id: string;
}

export interface CreateCustomerPayload {
  user_id?: string | null;
  company_name: string;
  contact_name: string;
  phone?: string | null;
  email: string;
  billing_address?: string | null;
  shipping_address?: string | null;
}

export interface AddCartItemPayload {
  customer_id: string;
  product_id: string;
  quantity: number;
}

export interface RemoveCartItemPayload {
  customer_id: string;
  product_id: string;
}

export interface CreateOrderItemPayload {
  product_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customer_id: string;
  notes?: string | null;
  items: CreateOrderItemPayload[];
}

export interface UpdateOrderStatusPayload {
  order_id: string;
  status: OrderStatus;
  approved_by?: string | null;
  rejection_reason?: string | null;
}

export interface CreateDeliveryPayload {
  order_id: string;
  driver_name?: string | null;
  vehicle_number?: string | null;
  scheduled_at?: string | null;
}

export interface UpdateDeliveryStatusPayload {
  delivery_id: string;
  status: DeliveryStatus;
  delivered_at?: string | null;
}

export interface LogInventoryMovementPayload {
  product_id: string;
  movement_type: InventoryMovementType;
  quantity_change: number;
  reference_type?: string | null;
  reference_id?: string | null;
  note?: string | null;
  created_by?: string | null;
}

export interface RecordPaymentPayload {
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  transaction_ref?: string | null;
  paid_at?: string | null;
}
