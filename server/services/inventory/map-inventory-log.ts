import type { InventoryLog } from "../../../types";
import { mapProduct } from "../products/map-product";

export function mapInventoryLog(record: InventoryLog): InventoryLog {
  return {
    ...record,
    product: record.product ? mapProduct(record.product) : undefined,
  };
}
