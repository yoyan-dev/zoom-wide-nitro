import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function deleteCategoryRecord(id: string): Promise<boolean> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return !!data;
}
