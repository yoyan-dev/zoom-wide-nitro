import type { Customer, Order, OrderDetail, OrderItem, Product } from "../../../types";
import { mapCustomer } from "../customers/map-customer";
import { mapProduct } from "../products/map-product";

type OrderRecord = Order & {
  customer?: unknown;
  items?: unknown;
};

type OrderItemRecord = OrderItem & {
  product?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapOrderItem(record: OrderItemRecord): OrderItem {
  return {
    ...record,
    product: isRecord(record.product)
      ? mapProduct(record.product as Product)
      : undefined,
    line_total: record.line_total ?? record.quantity * record.unit_price,
  };
}

export function mapOrder(record: OrderRecord): OrderDetail {
  const items = Array.isArray(record.items)
    ? (record.items as OrderItemRecord[]).map(mapOrderItem)
    : [];

  return {
    ...record,
    customer: isRecord(record.customer)
      ? mapCustomer(record.customer as Customer)
      : undefined,
    items,
    total_items: items.reduce((sum, item) => sum + item.quantity, 0),
    total_amount:
      record.total_amount ??
      items.reduce((sum, item) => sum + item.line_total, 0),
  };
}
