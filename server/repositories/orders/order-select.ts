import { PRODUCT_RELATION_SELECT } from "../products/product-select";

export const ORDER_DETAIL_SELECT = `*, customer:customer_id(*), items:order_items(*, product:product_id(${PRODUCT_RELATION_SELECT})), project_orders(project_id, project:project_id(*))`;
