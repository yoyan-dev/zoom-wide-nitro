import { createError, type H3Event } from "h3";
import type { Category } from "../../shared/types";
import type { CreateCategoryPayload, UpdateCategoryPayload } from "../types";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "../repositories/category.repo";
import { assertExists, getSupabaseClient } from "../utils/supabase";

export async function listCategoriesService(event: H3Event): Promise<Category[]> {
  return listCategories(getSupabaseClient(event));
}

export async function getCategoryService(
  event: H3Event,
  id: string
): Promise<Category> {
  const category = await getCategoryById(getSupabaseClient(event), id);
  return assertExists(category, "Category not found.");
}

export async function createCategoryService(
  event: H3Event,
  payload: CreateCategoryPayload
): Promise<Category> {
  if (!payload.name) {
    throw createError({
      statusCode: 400,
      statusMessage: "name is required.",
    });
  }

  return createCategory(getSupabaseClient(event), payload);
}

export async function updateCategoryService(
  event: H3Event,
  payload: UpdateCategoryPayload
): Promise<Category> {
  const supabase = getSupabaseClient(event);
  await getCategoryService(event, payload.id);

  const updated = await updateCategory(supabase, payload.id, payload);
  return assertExists(updated, "Category not found.");
}

export async function deleteCategoryService(
  event: H3Event,
  id: string
): Promise<{ success: true }> {
  await getCategoryService(event, id);
  await deleteCategory(getSupabaseClient(event), id);
  return { success: true };
}
