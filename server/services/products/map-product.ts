import type { Category, Product, Supplier, Warehouse } from "../../types";
import { mapCategory } from "../categories/map-category";
import { mapSupplier } from "../suppliers/map-supplier";

type ProductRecord = Product & {
  category?: unknown;
  supplier?: unknown;
  warehouse?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapWarehouse(record: Warehouse): Warehouse {
  return {
    ...record,
  };
}

export function mapProduct(record: ProductRecord): Product {
  return {
    ...record,
    description: record.description ?? undefined,
    image_url: record.image_url ?? undefined,
    handbook: record.handbook ?? undefined,
    category: isRecord(record.category)
      ? mapCategory(record.category as Category)
      : undefined,
    supplier: isRecord(record.supplier)
      ? mapSupplier(record.supplier as Supplier)
      : undefined,
    warehouse: isRecord(record.warehouse)
      ? mapWarehouse(record.warehouse as Warehouse)
      : undefined,
  };
}
