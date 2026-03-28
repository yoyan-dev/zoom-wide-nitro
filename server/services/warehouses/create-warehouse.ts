import type { MultiPartData } from "h3";
import type { Warehouse } from "../../types";
import { createWarehouseRecord } from "../../repositories/warehouses/create-warehouse";
import { createWarehouseSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { parseWarehouseMultipartFields } from "../../utils/resource-form-data";

export async function createWarehouse(
  parts: MultiPartData[],
): Promise<Warehouse> {
  let body: ReturnType<typeof parseWarehouseMultipartFields>;

  try {
    body = parseWarehouseMultipartFields(parts);
  } catch (error) {
    throw badRequestError(
      error instanceof Error ? error.message : "Invalid warehouse form data",
    );
  }

  const parsedBody = createWarehouseSchema.safeParse(body);

  if (!parsedBody.success) {
    throw badRequestError(parsedBody.error.message);
  }

  return createWarehouseRecord(parsedBody.data);
}
