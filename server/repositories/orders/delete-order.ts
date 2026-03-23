import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function deleteOrderRecord(id: string): Promise<void> {
  const supabase = useRepositoryClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);

  ensureRepositorySuccess(error);
}
