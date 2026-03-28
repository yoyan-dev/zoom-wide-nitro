import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function deleteDriverRecord(id: string): Promise<boolean> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("drivers")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return !!data;
}
