import type { z } from "zod";
import type { Category } from "../../types";
import { createCategorySchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export async function createCategoryRecord(
  input: CreateCategoryInput,
): Promise<Category> {
  const supabase = useRepositoryClient();
  const payload = {
    name: input.name,
    description: input.description,
    overview: input.overview ?? null,
    typical_uses: input.typical_uses,
    buying_considerations: input.buying_considerations,
    featured_specs: input.featured_specs,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);
  return data as Category;
}
