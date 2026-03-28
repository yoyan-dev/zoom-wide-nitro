import type { Driver } from "../../types";
import { getDriverByIdRecord } from "../../repositories/drivers/get-driver-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";

export async function getDriverById(id: unknown): Promise<Driver> {
  const driverId = string(id, "Driver id");
  const driver = await getDriverByIdRecord(driverId);

  if (!driver) {
    throw notFoundError("Driver not found");
  }

  return driver;
}
