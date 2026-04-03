import { getCategoryByIdRecord } from "../../repositories/categories/get-category-by-id";
import { getWarehouseByIdRecord } from "../../repositories/warehouses/get-warehouse-by-id";
import { notFoundError } from "../../utils/errors";

type ProductReferenceInput = {
  category_id?: string;
  warehouse_id?: string | null;
};

export async function validateProductReferences(
  input: ProductReferenceInput,
): Promise<void> {
  const [category, warehouse] = await Promise.all([
    input.category_id
      ? getCategoryByIdRecord(input.category_id)
      : Promise.resolve(null),
    input.warehouse_id
      ? getWarehouseByIdRecord(input.warehouse_id)
      : Promise.resolve(null),
  ]);

  if (input.category_id && !category) {
    throw notFoundError("Category not found");
  }

  if (input.warehouse_id && !warehouse) {
    throw notFoundError("Warehouse not found");
  }
}
