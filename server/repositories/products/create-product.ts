import type { z } from "zod";
import type { Product } from "../../../types";
import { createProductSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PRODUCT_RELATION_SELECT } from "./product-select";

type CreateProductInput = z.infer<typeof createProductSchema>;

export async function createProductRecord(
  input: CreateProductInput,
): Promise<Product> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();

  const insertPayload = {
    category_id: input.category_id,
    supplier_id: input.supplier_id ?? null,
    warehouse_id: input.warehouse_id ?? null,
    sku: input.sku,
    name: input.name,
    description: input.description ?? null,
    image_url: input.image_url ?? null,
    unit: input.unit,
    price: input.price,
    stock_quantity: input.stock_quantity,
    minimum_stock_quantity: input.minimum_stock_quantity,
    handbook: input.handbook ?? null,
    is_active: input.is_active,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(insertPayload)
    .select(PRODUCT_RELATION_SELECT)
    .single();

  ensureRepositorySuccess(error);

  return (data ?? {}) as Product;
}
