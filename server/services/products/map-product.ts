import type { Category, Product } from "../../types";
import { mapCategory } from "../categories/map-category";

type ProductRecord = Product & {
  category?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
  };
}
