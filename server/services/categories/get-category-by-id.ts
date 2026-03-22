import type { Category } from "../../../types";
import { getCategoryByIdRecord } from "../../repositories/categories/get-category-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapCategory } from "./map-category";

export async function getCategoryById(id: unknown): Promise<Category> {
  const categoryId = string(id, "Category id");
  const category = await getCategoryByIdRecord(categoryId);

  if (!category) {
    throw notFoundError("Category not found");
  }

  return mapCategory(category);
}
