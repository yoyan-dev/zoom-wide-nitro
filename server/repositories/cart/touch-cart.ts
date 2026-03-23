import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function touchCartRecord(id: string): Promise<void> {
  const supabase = useRepositoryClient();
  const { error } = await supabase
    .from("cart")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  ensureRepositorySuccess(error);
}
