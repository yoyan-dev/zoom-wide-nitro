import type { AuthChangePasswordResponseData } from "../../types";
import { signInWithPassword, updateSupabaseAuthUser } from "../../lib/supabase";
import { changePasswordSchema } from "../../schemas";
import {
  badRequestError,
  internalServerError,
  unauthorizedError,
} from "../../utils/errors";
import { requireActiveRequestUser } from "../../utils/permissions";

function isInvalidLoginError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("email not confirmed")
  );
}

export async function changePassword(
  event: Parameters<typeof requireActiveRequestUser>[0],
  input: unknown,
): Promise<AuthChangePasswordResponseData> {
  const user = requireActiveRequestUser(event);
  const parsedInput = changePasswordSchema.safeParse(input);

  if (!parsedInput.success) {
    throw badRequestError(parsedInput.error.message);
  }

  if (!user.email) {
    throw badRequestError("User email is required to change password");
  }

  if (parsedInput.data.current_password === parsedInput.data.new_password) {
    throw badRequestError(
      "New password must be different from the current password",
    );
  }

  const { data, error } = await signInWithPassword({
    email: user.email,
    password: parsedInput.data.current_password,
  });

  if (error || !data.user || data.user.id !== user.id) {
    if (isInvalidLoginError(error)) {
      throw unauthorizedError("Current password is incorrect");
    }

    throw unauthorizedError(error?.message ?? "Unable to verify current password");
  }

  try {
    await updateSupabaseAuthUser({
      userId: user.id,
      password: parsedInput.data.new_password,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw internalServerError(error.message);
    }

    throw internalServerError("Unable to change password");
  }

  return {
    password_changed: true,
  };
}
