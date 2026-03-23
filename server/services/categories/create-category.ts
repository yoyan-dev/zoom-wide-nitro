import type { MultiPartData } from "h3";
import type { Category } from "../../../types";
import { createCategoryRecord } from "../../repositories/categories/create-category";
import { createCategorySchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { parseCategoryMultipartFields } from "../../utils/category-form-data";
import { mapCategory } from "./map-category";

export async function createCategory(parts: MultiPartData[]): Promise<Category> {
  let body: ReturnType<typeof parseCategoryMultipartFields>;

  try {
    body = parseCategoryMultipartFields(parts);
  } catch (error) {
    throw badRequestError(
      error instanceof Error ? error.message : "Invalid category form data",
    );
  }

  const parsedBody = createCategorySchema.safeParse(body);

  if (!parsedBody.success) {
    throw badRequestError(parsedBody.error.message);
  }

  const category = await createCategoryRecord(parsedBody.data);

  return mapCategory(category);
}
