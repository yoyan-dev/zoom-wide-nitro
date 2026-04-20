import { getCategoryByIdRecord } from "../../repositories/categories/get-category-by-id";
import { notFoundError } from "../../utils/errors";

type ProductReferenceInput = {
  category_id?: string;
};

export async function validateProductReferences(
  input: ProductReferenceInput,
): Promise<void> {
  const category = input.category_id
    ? await getCategoryByIdRecord(input.category_id)
    : null;

  if (input.category_id && !category) {
    throw notFoundError("Category not found");
  }
}
