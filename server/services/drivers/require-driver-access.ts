import type { H3Event } from "h3";
import type { Driver } from "../../types";
import { getDriverByIdRecord } from "../../repositories/drivers/get-driver-by-id";
import { forbiddenError, notFoundError } from "../../utils/errors";
import {
  hasRole,
  requireActiveRequestUser,
} from "../../utils/permissions";
import { string } from "../../utils/validator";

export async function requireDriverAccess(
  event: H3Event,
  driverId: unknown,
  message = "You do not have permission to access this driver resource",
): Promise<Driver> {
  const resolvedDriverId = string(driverId, "Driver id");
  const driver = await getDriverByIdRecord(resolvedDriverId);

  if (!driver) {
    throw notFoundError("Driver not found");
  }

  const requestUser = requireActiveRequestUser(event);

  if (
    requestUser.id === driver.user_id ||
    hasRole(requestUser, ["admin", "staff"])
  ) {
    return driver;
  }

  throw forbiddenError(message);
}
