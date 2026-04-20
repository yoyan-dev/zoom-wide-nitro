import type { ProjectOrder } from "../../types";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

export async function createProjectOrderRecord(input: {
  project_id: string;
  order_id: string;
}): Promise<ProjectOrder> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("project_orders")
    .insert({
      project_id: input.project_id,
      order_id: input.order_id,
    })
    .select("*")
    .single();

  ensureRepositorySuccess(error);
  return data as ProjectOrder;
}
