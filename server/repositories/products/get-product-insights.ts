import type { OrderStatus, Product } from "../../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PRODUCT_RELATION_SELECT } from "./product-select";

const TOP_SELLING_ORDER_STATUSES: OrderStatus[] = ["approved", "completed"];

type OrderItemInsightRecord = {
  product_id: string;
  quantity: number;
  line_total: number;
  product?: Product | null;
  order?: {
    status?: OrderStatus | null;
  } | null;
};

export async function getLowStockProductRecords(): Promise<Product[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATION_SELECT)
    .order("created_at", { ascending: false });

  ensureRepositorySuccess(error);
  return (data ?? []) as Product[];
}

export async function getRecentProductRecords(limit: number): Promise<Product[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATION_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  ensureRepositorySuccess(error);
  return (data ?? []) as Product[];
}

export async function getTopSellingProductRecords(): Promise<OrderItemInsightRecord[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("order_items")
    .select(
      `product_id, quantity, line_total, product:product_id(${PRODUCT_RELATION_SELECT}), order:order_id(status)`,
    );

  ensureRepositorySuccess(error);

  return ((data ?? []) as OrderItemInsightRecord[]).filter((record) =>
    TOP_SELLING_ORDER_STATUSES.includes(record.order?.status ?? "pending"),
  );
}

export async function getProductCategoryCountRecords(): Promise<Product[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATION_SELECT);

  ensureRepositorySuccess(error);
  return (data ?? []) as Product[];
}
