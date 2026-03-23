import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function deleteCustomerRecord(id: string): Promise<boolean> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return !!data;
}
