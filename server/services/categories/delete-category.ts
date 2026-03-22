import { deleteCategoryRecord } from "../../repositories/categories/delete-category";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

export async function deleteCategory(id: unknown): Promise<void> {
  const categoryId = string(id, "Category id");
  const deleted = await deleteCategoryRecord(categoryId);

  if (!deleted) {
    throw notFoundError("Category not found");
  }
}
