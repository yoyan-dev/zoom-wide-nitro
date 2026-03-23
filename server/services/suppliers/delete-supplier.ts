import { deleteSupplierRecord } from "../../repositories/suppliers/delete-supplier";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

export async function deleteSupplier(id: unknown): Promise<void> {
  const supplierId = string(id, "Supplier id");
  const deleted = await deleteSupplierRecord(supplierId);

  if (!deleted) {
    throw notFoundError("Supplier not found");
  }
}
