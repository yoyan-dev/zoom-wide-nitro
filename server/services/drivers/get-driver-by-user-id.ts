import type { Driver } from "../../types";
import { getDriverByUserIdRecord } from "../../repositories/drivers/get-driver-by-user-id";

export async function getDriverByUserId(
  userId: string,
): Promise<Driver | null> {
  return getDriverByUserIdRecord(userId);
}
