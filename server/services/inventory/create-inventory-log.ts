import type { MultiPartData } from "h3";
import type { InventoryLog } from "../../../types";
import { createInventoryLogRecord } from "../../repositories/inventory/create-inventory-log";
import { createInventoryLogSchema } from "../../schemas";
import { badRequestError } from "../../utils/errors";
import { parseInventoryMultipartFields } from "../../utils/resource-form-data";

export async function createInventoryLog(
  parts: MultiPartData[],
): Promise<InventoryLog> {
  let body: ReturnType<typeof parseInventoryMultipartFields>;

  try {
    body = parseInventoryMultipartFields(parts);
  } catch (error) {
    throw badRequestError(
      error instanceof Error ? error.message : "Invalid inventory form data",
    );
  }

  const parsedBody = createInventoryLogSchema.safeParse(body);

  if (!parsedBody.success) {
    throw badRequestError(parsedBody.error.message);
  }

  return createInventoryLogRecord(parsedBody.data);
}
