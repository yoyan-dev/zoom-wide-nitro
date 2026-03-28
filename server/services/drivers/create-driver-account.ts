import type { Driver } from "../../types";
import { deleteSupabaseAuthUser } from "../../lib/supabase";
import { createDriverRecord } from "../../repositories/drivers/create-driver";
import { createDriverSchema } from "../../schemas";
import {
  badRequestError,
  conflictError,
  internalServerError,
} from "../../utils/errors";
import { createManagedUserAccount } from "../users/create-managed-user-account";
import { isDuplicateUserError } from "../users/user-account-errors";

export async function createDriverAccount(input: unknown): Promise<Driver> {
  const parsedInput = createDriverSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  let userId: string | null = null;

  try {
    const user = await createManagedUserAccount({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      full_name: parsedInput.data.name,
      role: "driver",
      phone: parsedInput.data.phone ?? null,
      image_url: parsedInput.data.image_url ?? null,
    });

    userId = user.id;

    return await createDriverRecord({
      user_id: user.id,
      name: parsedInput.data.name,
      phone: parsedInput.data.phone ?? null,
      email: parsedInput.data.email,
      image_url: parsedInput.data.image_url ?? null,
      license_number: parsedInput.data.license_number ?? null,
      vehicle_number: parsedInput.data.vehicle_number ?? null,
      is_active: user.is_active,
    });
  } catch (error) {
    if (userId) {
      try {
        await deleteSupabaseAuthUser(userId);
      } catch {
        throw internalServerError(
          "Driver account creation failed and auth cleanup could not be completed",
        );
      }
    }

    if (isDuplicateUserError(error)) {
      throw conflictError("A driver account with this email already exists");
    }

    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to create driver account");
  }
}
