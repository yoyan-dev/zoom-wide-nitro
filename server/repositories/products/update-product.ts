import type { z } from "zod";
import type { Product } from "../../types";
import { updateProductSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PRODUCT_RELATION_SELECT } from "./product-select";

type UpdateProductInput = z.infer<typeof updateProductSchema>;

export async function updateProductRecord(
  id: string,
  input: UpdateProductInput,
): Promise<Product | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      category_id: input.category_id,
      supplier_id: input.supplier_id,
      warehouse_id: input.warehouse_id,
      sku: input.sku,
      name: input.name,
      description: input.description,
      image_url: input.image_url,
      unit: input.unit,
      price: input.price,
      stock_quantity: input.stock_quantity,
      minimum_stock_quantity: input.minimum_stock_quantity,
      handbook: input.handbook,
      is_active: input.is_active,
      updated_at: new Date().toISOString(),
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select(PRODUCT_RELATION_SELECT)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Product | null);
}
