import type { Category } from "../../types";
import { getCategoryByIdRecord } from "../../repositories/categories/get-category-by-id";
import { updateCategoryRecord } from "../../repositories/categories/update-category";
import { updateCategorySchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapCategory } from "./map-category";

type UpdateCategoryParams = {
  id: unknown;
  input: unknown;
};

export async function updateCategory(
  params: UpdateCategoryParams,
): Promise<Category> {
  const categoryId = string(params.id, "Category id");
  const parsedInput = updateCategorySchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    const existingCategory = await getCategoryByIdRecord(categoryId);

    if (!existingCategory) {
      throw notFoundError("Category not found");
    }

    return mapCategory(existingCategory);
  }

  const updatedCategory = await updateCategoryRecord(
    categoryId,
    parsedInput.data,
  );

  if (!updatedCategory) {
    throw notFoundError("Category not found");
  }

  return mapCategory(updatedCategory);
}
