import type { Product } from "../../../types";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";
import { PRODUCT_RELATION_SELECT } from "./product-select";

export async function getProductByIdRecord(id: string): Promise<Product | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Product | null);
}
