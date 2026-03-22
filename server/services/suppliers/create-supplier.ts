import type { MultiPartData } from "h3";
import type { Supplier } from "../../../types";
import { createSupplierRecord } from "../../repositories/suppliers/create-supplier";
import { createSupplierSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { parseSupplierMultipartFields } from "../../utils/resource-form-data";
import { mapSupplier } from "./map-supplier";

export async function createSupplier(parts: MultiPartData[]): Promise<Supplier> {
  let body: ReturnType<typeof parseSupplierMultipartFields>;

  try {
    body = parseSupplierMultipartFields(parts);
  } catch (error) {
    throw badRequestError(
      error instanceof Error ? error.message : "Invalid supplier form data",
    );
  }

  const parsedBody = createSupplierSchema.safeParse(body);

  if (!parsedBody.success) {
    throw badRequestError(parsedBody.error.message);
  }

  const supplier = await createSupplierRecord(parsedBody.data);

  return mapSupplier(supplier);
}
