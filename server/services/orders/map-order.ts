import type {
  Customer,
  Order,
  OrderDetail,
  OrderItem,
  Project,
  Product,
} from "../../types";
import { mapCustomer } from "../customers/map-customer";
import { mapProduct } from "../products/map-product";

type OrderRecord = Order & {
  customer?: unknown;
  items?: unknown;
  project_orders?: unknown;
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
  const projectLink =
    Array.isArray(record.project_orders) &&
    record.project_orders.length > 0 &&
    isRecord(record.project_orders[0])
      ? (record.project_orders[0] as {
          project_id?: string | null;
          project?: unknown;
        })
      : null;

  return {
    ...record,
    customer: isRecord(record.customer)
      ? mapCustomer(record.customer as Customer)
      : undefined,
    project_id: projectLink?.project_id ?? null,
    project:
      projectLink?.project && isRecord(projectLink.project)
        ? (projectLink.project as Project)
        : null,
    items,
    total_items: items.reduce((sum, item) => sum + item.quantity, 0),
    total_amount:
      record.total_amount ??
      items.reduce((sum, item) => sum + item.line_total, 0),
  };
}
