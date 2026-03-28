import type { z } from "zod";
import type { Category } from "../../types";
import { updateCategorySchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export async function updateCategoryRecord(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      name: input.name,
      description: input.description,
      overview: input.overview,
      typical_uses: input.typical_uses,
      buying_considerations: input.buying_considerations,
      featured_specs: input.featured_specs,
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Category | null);
}
