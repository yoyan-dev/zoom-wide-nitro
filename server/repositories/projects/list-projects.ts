import type { Project } from "../../types";
import {
  ensureRepositorySuccess,
  mapListResult,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function listProjectRecords(userId: string): Promise<Project[]> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  ensureRepositorySuccess(error);
  return mapListResult({ data: (data ?? []) as Project[], count: null }).data;
}
