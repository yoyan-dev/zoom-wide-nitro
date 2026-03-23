import type { Supplier } from "../../../types";
import { getSupplierByIdRecord } from "../../repositories/suppliers/get-supplier-by-id";
import { updateSupplierRecord } from "../../repositories/suppliers/update-supplier";
import { updateSupplierSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { mapSupplier } from "./map-supplier";

type UpdateSupplierParams = {
  id: unknown;
  input: unknown;
};

export async function updateSupplier(
  params: UpdateSupplierParams,
): Promise<Supplier> {
  const supplierId = string(params.id, "Supplier id");
  const parsedInput = updateSupplierSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    const existingSupplier = await getSupplierByIdRecord(supplierId);

    if (!existingSupplier) {
      throw notFoundError("Supplier not found");
    }

    return mapSupplier(existingSupplier);
  }

  const updatedSupplier = await updateSupplierRecord(supplierId, parsedInput.data);

  if (!updatedSupplier) {
    throw notFoundError("Supplier not found");
  }

  return mapSupplier(updatedSupplier);
}
