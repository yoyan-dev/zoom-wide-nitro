import { PRODUCT_RELATION_SELECT } from "../products/product-select";

export const INVENTORY_LOG_SELECT =
  `id, product_id, movement_type, quantity_change, reference_type, reference_id, note, created_by, created_at, product:product_id(${PRODUCT_RELATION_SELECT})`;
