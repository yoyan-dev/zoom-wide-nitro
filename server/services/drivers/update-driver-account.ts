import type { Driver } from "../../types";
import { getDriverByIdRecord } from "../../repositories/drivers/get-driver-by-id";
import {
  updateDriverRecord,
  type UpdateDriverRecordInput,
} from "../../repositories/drivers/update-driver";
import { updateDriverSchema } from "../../schemas";
import {
  badRequestError,
  conflictError,
  internalServerError,
  notFoundError,
} from "../../utils/errors";
import { string } from "../../utils/validator";
import { updateManagedUser } from "../users/managed-users";
import { isDuplicateUserError } from "../users/user-account-errors";

type UpdateDriverAccountParams = {
  id: unknown;
  input: unknown;
};

export async function updateDriverAccount(
  params: UpdateDriverAccountParams,
): Promise<Driver> {
  const driverId = string(params.id, "Driver id");
  const existingDriver = await getDriverByIdRecord(driverId);

  if (!existingDriver) {
    throw notFoundError("Driver not found");
  }

  const parsedInput = updateDriverSchema.safeParse(params.input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  const hasUpdates = Object.values(parsedInput.data).some(
    (value) => value !== undefined,
  );

  if (!hasUpdates) {
    return existingDriver;
  }

  const driverRecordUpdates: UpdateDriverRecordInput = {
    name: parsedInput.data.name,
    phone: parsedInput.data.phone,
    email: parsedInput.data.email,
    image_url: parsedInput.data.image_url,
    license_number: parsedInput.data.license_number,
    vehicle_number: parsedInput.data.vehicle_number,
    is_active: parsedInput.data.is_active,
  };
  const hasDriverRecordUpdates = Object.values(driverRecordUpdates).some(
    (value) => value !== undefined,
  );

  let updatedDriver = existingDriver;

  if (hasDriverRecordUpdates) {
    try {
      const driverRecord = await updateDriverRecord(driverId, driverRecordUpdates);

      if (!driverRecord) {
        throw notFoundError("Driver not found");
      }

      updatedDriver = driverRecord;
    } catch (error) {
      if (isDuplicateUserError(error)) {
        throw conflictError("A driver account with this email already exists");
      }

      if (error instanceof Error) {
        throw internalServerError(error.message);
      }

      throw internalServerError("Unable to update driver account");
    }
  }

  const hasManagedUserUpdates =
    parsedInput.data.email !== undefined ||
    parsedInput.data.password !== undefined ||
    parsedInput.data.name !== undefined ||
    parsedInput.data.phone !== undefined ||
    parsedInput.data.image_url !== undefined ||
    parsedInput.data.is_active !== undefined;

  if (!hasManagedUserUpdates || !existingDriver.user_id) {
    return updatedDriver;
  }

  try {
    await updateManagedUser({
      id: existingDriver.user_id,
      input: {
        email: parsedInput.data.email,
        password: parsedInput.data.password,
        full_name: parsedInput.data.name,
        phone: parsedInput.data.phone,
        image_url: parsedInput.data.image_url,
        is_active: parsedInput.data.is_active,
      },
      allowedRoles: ["driver"],
      notFoundMessage: "Driver not found",
    });

    return updatedDriver;
  } catch (error) {
    if (hasDriverRecordUpdates) {
      try {
        const rollbackRecord = await updateDriverRecord(driverId, {
          name: existingDriver.name,
          phone: existingDriver.phone,
          email: existingDriver.email ?? undefined,
          image_url: existingDriver.image_url,
          license_number: existingDriver.license_number,
          vehicle_number: existingDriver.vehicle_number,
          is_active: existingDriver.is_active,
        });

        if (!rollbackRecord) {
          throw new Error("Rollback driver record not found");
        }
      } catch {
        throw internalServerError(
          "Driver account update failed and driver record rollback could not be completed",
        );
      }
    }

    if (isDuplicateUserError(error)) {
      throw conflictError("A driver account with this email already exists");
    }

    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to update driver account");
  }
}
