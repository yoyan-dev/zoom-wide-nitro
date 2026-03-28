import { deleteDriverRecord } from "../../repositories/drivers/delete-driver";
import { getDriverByIdRecord } from "../../repositories/drivers/get-driver-by-id";
import { notFoundError } from "../../utils/errors";
import { string } from "../../utils/validator";
import { deleteManagedUser } from "../users/managed-users";

export async function deleteDriverAccount(id: unknown): Promise<void> {
  const driverId = string(id, "Driver id");
  const driver = await getDriverByIdRecord(driverId);

  if (!driver) {
    throw notFoundError("Driver not found");
  }

  if (driver.user_id) {
    await deleteManagedUser({
      id: driver.user_id,
      allowedRoles: ["driver"],
      notFoundMessage: "Driver not found",
    });
  }

  await deleteDriverRecord(driverId);
}
