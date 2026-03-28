import type { Category } from "../../types";

export function mapCategory(record: Category): Category {
  return {
    ...record,
    overview: record.overview ?? undefined,
  };
}
