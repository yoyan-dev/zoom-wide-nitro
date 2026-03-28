import type { User, UserRole } from "../../types";
import {
  createSupabaseAuthUser,
  deleteSupabaseAuthUser,
} from "../../lib/supabase";
import { createUserRecord } from "../../repositories/users/create-user";
import { conflictError, internalServerError } from "../../utils/errors";

type CreateManagedUserAccountInput = {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
};

function isDuplicateUserError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("already been registered") ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("duplicate")
  );
}

export async function createManagedUserAccount(
  input: CreateManagedUserAccountInput,
): Promise<User> {
  let authUserId: string | null = null;

  try {
    const authUser = await createSupabaseAuthUser({
      email: input.email,
      password: input.password,
      role: input.role,
      fullName: input.full_name,
      phone: input.phone ?? null,
    });

    authUserId = authUser.id;

    return await createUserRecord({
      id: authUser.id,
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      phone: input.phone ?? null,
    });
  } catch (error) {
    if (authUserId) {
      try {
        await deleteSupabaseAuthUser(authUserId);
      } catch {
        throw internalServerError(
          "User account creation failed and auth cleanup could not be completed",
        );
      }
    }

    if (isDuplicateUserError(error)) {
      throw conflictError("An account with this email already exists");
    }

    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to create user account");
  }
}
