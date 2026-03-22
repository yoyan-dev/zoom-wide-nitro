import { PRODUCT_RELATION_SELECT } from "../products/product-select";

export const CART_DETAIL_SELECT = `*, items:cart_items(*, product:product_id(${PRODUCT_RELATION_SELECT}))`;
