import type { Warehouse } from "../../../types";
import { getWarehouseByIdRecord } from "../../repositories/warehouses/get-warehouse-by-id";
import { updateWarehouseRecord } from "../../repositories/warehouses/update-warehouse";
import { updateWarehouseSchema } from "../../schemas";
import { badRequestError, notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

type UpdateWarehouseParams = {
  id: unknown;
  input: unknown;
};

export async function updateWarehouse(
  params: UpdateWarehouseParams,
): Promise<Warehouse> {
  const warehouseId = string(params.id, "Warehouse id");
  const parsedInput = updateWarehouseSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    const existingWarehouse = await getWarehouseByIdRecord(warehouseId);

    if (!existingWarehouse) {
      throw notFoundError("Warehouse not found");
    }

    return existingWarehouse;
  }

  const updatedWarehouse = await updateWarehouseRecord(
    warehouseId,
    parsedInput.data,
  );

  if (!updatedWarehouse) {
    throw notFoundError("Warehouse not found");
  }

  return updatedWarehouse;
}
