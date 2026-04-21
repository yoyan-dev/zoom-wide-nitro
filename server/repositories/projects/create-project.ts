import type { z } from "zod";
import type { Project } from "../../types";
import { createProjectSchema } from "../../schemas";
import {
  ensureRepositorySuccess,
  useRepositoryClient,
} from "../../utils/supabase-repository";

type CreateProjectInput = z.infer<typeof createProjectSchema> & {
  user_id: string;
};

export async function createProjectRecord(
  input: CreateProjectInput,
): Promise<Project> {
  const supabase = useRepositoryClient();
  const payload = {
    user_id: input.user_id,
    name: input.name,
    location: input.location ?? null,
    description: input.description ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    status: "active",
    progress: input.progress ?? 0,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);
  return data as Project;
}
