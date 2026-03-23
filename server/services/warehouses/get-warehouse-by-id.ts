import type { Warehouse } from "../../../types";
import { getWarehouseByIdRecord } from "../../repositories/warehouses/get-warehouse-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

export async function getWarehouseById(id: unknown): Promise<Warehouse> {
  const warehouseId = string(id, "Warehouse id");
  const warehouse = await getWarehouseByIdRecord(warehouseId);

  if (!warehouse) {
    throw notFoundError("Warehouse not found");
  }

  return warehouse;
}
