import type { z } from "zod";
import type { Project, ProjectItem, ProjectOrder } from "../types";
import {
  createProjectItemSchema,
  createProjectSchema,
  updateProjectItemSchema,
  updateProjectSchema,
} from "../schemas/project";
import {
  ensureRepositorySuccess,
  mapListResult,
  mapOptionalRecord,
  useRepositoryClient,
} from "../utils/supabase-repository";

type CreateProjectInput = z.infer<typeof createProjectSchema> & {
  user_id: string;
};

type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
type CreateProjectItemInput = {
  project_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
};
type UpdateProjectItemInput = z.infer<typeof updateProjectItemSchema> & {
  unit_price?: number;
};

export async function createProjectRecord(
  input: CreateProjectInput,
): Promise<Project> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();
  const payload = {
    user_id: input.user_id,
    name: input.name,
    location: input.location ?? null,
    description: input.description ?? null,
    start_date: input.start_date ?? null,
    end_date: input.end_date ?? null,
    status: input.status ?? "active",
    progress: input.progress ?? 0,
    budget: input.budget ?? null,
    total_orders: 0,
    total_spent: 0,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);
  return data as Project;
}

export async function listProjectsByUserId(userId: string): Promise<Project[]> {
  const supabase = useRepositoryClient();
  const { data, error, count } = await supabase
    .from("projects")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  ensureRepositorySuccess(error);
  return mapListResult({ data: (data ?? []) as Project[], count }).data;
}

export async function getProjectByIdRecord(id: string): Promise<Project | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Project | null);
}

export async function updateProjectRecord(
  id: string,
  input: UpdateProjectInput,
): Promise<Project | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      name: input.name,
      location: input.location,
      description: input.description,
      start_date: input.start_date,
      end_date: input.end_date,
      status: input.status,
      progress: input.progress,
      budget: input.budget,
      updated_at: new Date().toISOString(),
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

export async function deleteProjectRecord(id: string): Promise<boolean> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return !!data;
}

export async function listProjectItemsByProjectId(
  projectId: string,
): Promise<ProjectItem[]> {
  const supabase = useRepositoryClient();
  const { data, error, count } = await supabase
    .from("project_items")
    .select("*", { count: "exact" })
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  ensureRepositorySuccess(error);
  return mapListResult({ data: (data ?? []) as ProjectItem[], count }).data;
}

export async function getProjectItemByIdRecord(
  id: string,
): Promise<ProjectItem | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("project_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as ProjectItem | null);
}

export async function getProjectItemByProductRecord(params: {
  project_id: string;
  product_id: string;
}): Promise<ProjectItem | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("project_items")
    .select("*")
    .eq("project_id", params.project_id)
    .eq("product_id", params.product_id)
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as ProjectItem | null);
}

export async function createProjectItemRecord(
  input: CreateProjectItemInput,
): Promise<ProjectItem> {
  const supabase = useRepositoryClient();
  const now = new Date().toISOString();
  const payload = {
    project_id: input.project_id,
    product_id: input.product_id,
    quantity: input.quantity,
    unit_price: input.unit_price,
    total_price: input.quantity * input.unit_price,
    created_at: now,
  };

  const { data, error } = await supabase
    .from("project_items")
    .insert(payload)
    .select("*")
    .single();

  ensureRepositorySuccess(error);
  return data as ProjectItem;
}

export async function updateProjectItemRecord(
  id: string,
  input: UpdateProjectItemInput,
): Promise<ProjectItem | null> {
  const supabase = useRepositoryClient();
  const updates = Object.fromEntries(
    Object.entries({
      quantity: input.quantity,
      unit_price: input.unit_price,
      total_price:
        input.quantity !== undefined && input.unit_price !== undefined
          ? input.quantity * input.unit_price
          : undefined,
    }).filter(([, value]) => value !== undefined),
  );

  const { data, error } = await supabase
    .from("project_items")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as ProjectItem | null);
}

export async function deleteProjectItemRecord(id: string): Promise<boolean> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("project_items")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return !!data;
}

export async function createProjectOrderRecord(input: {
  project_id: string;
  order_id: string;
  total_amount: number;
}): Promise<ProjectOrder> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("project_orders")
    .insert({
      project_id: input.project_id,
      order_id: input.order_id,
      total_amount: input.total_amount,
    })
    .select("*")
    .single();

  ensureRepositorySuccess(error);
  return data as ProjectOrder;
}

export async function updateProjectStatsRecord(params: {
  projectId: string;
  totalOrders: number;
  totalSpent: number;
}): Promise<Project | null> {
  const supabase = useRepositoryClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      total_orders: params.totalOrders,
      total_spent: params.totalSpent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.projectId)
    .select("*")
    .maybeSingle();

  ensureRepositorySuccess(error);
  return mapOptionalRecord((data ?? null) as Project | null);
}
