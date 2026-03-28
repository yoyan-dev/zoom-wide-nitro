import type { Supplier } from "../../types";
import { getSupplierByIdRecord } from "../../repositories/suppliers/get-supplier-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapSupplier } from "./map-supplier";

export async function getSupplierById(id: unknown): Promise<Supplier> {
  const supplierId = string(id, "Supplier id");
  const supplier = await getSupplierByIdRecord(supplierId);

  if (!supplier) {
    throw notFoundError("Supplier not found");
  }

  return mapSupplier(supplier);
}
