import type { CartDetail, CartItem, Product } from "../../../types";
import type { CartRecord } from "../../repositories/cart/get-active-cart-by-customer-id";
import { mapProduct } from "../products/map-product";

type CartItemRecord = CartItem & {
  product?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapCartItem(record: CartItemRecord): CartItem {
  return {
    ...record,
    product: isRecord(record.product)
      ? mapProduct(record.product as Product)
      : undefined,
    line_total: record.quantity * record.unit_price,
  };
}

export function mapCart(record: CartRecord): CartDetail {
  const items = (record.items ?? []).map(mapCartItem);

  return {
    ...record,
    items,
    total_items: items.reduce((sum, item) => sum + item.quantity, 0),
    total_amount: items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    ),
  };
}
