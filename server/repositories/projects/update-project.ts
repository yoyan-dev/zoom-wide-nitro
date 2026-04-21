import type { z } from "zod";
import type { Project } from "../../types";
import { updateProjectSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  mapOptionalRecord,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export async function updateProjectRecord(
  id: string,
  input: UpdateProjectInput,
): Promise<Project | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      name: input.name,
      location: input.location,
      start_date: input.start_date,
      end_date: input.end_date,
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Project | null);
}
